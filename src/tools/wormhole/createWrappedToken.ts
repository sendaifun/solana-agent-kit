import { Wormhole, signSendWait, wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import sui from "@wormhole-foundation/sdk/sui";
import aptos from "@wormhole-foundation/sdk/aptos";
import { getSigner } from "./helper";
import {
  Chain,
  Network,
  TokenAddress,
  UniversalAddress,
} from "@wormhole-foundation/sdk";
import { CreateWrappedTokenInput } from "../../types";

/**
 * Interface for the input parameters to create a wrapped token
 *
 * @property {Chain} destinationChain - The target blockchain where the wrapped token will be created
 * @property {string} tokenAddress - The address of the token on Solana to be wrapped
 * @property {Network} network - The network to use ("Mainnet", "Testnet", or "Devnet")
 */

/**
 * Interface for the response from creating a wrapped token
 *
 * @property {boolean} success - Whether the operation was successful
 * @property {Object} [wrappedToken] - Information about the wrapped token (if successful)
 * @property {Chain} wrappedToken.chain - The chain where the wrapped token was created
 * @property {string|TokenAddress<Chain>|UniversalAddress} wrappedToken.address - The address of the wrapped token
 * @property {string} [attestationTxid] - The transaction ID of the attestation transaction
 * @property {string} [error] - Error message if the operation failed
 */
export interface CreateWrappedTokenResponse {
  success: boolean;
  wrappedToken?: {
    chain: Chain;
    address: string | TokenAddress<Chain> | UniversalAddress;
  };
  attestationTxid?: string;
  error?: string;
}

/**
 * Checks if a token is already wrapped on the destination chain
 *
 * This function queries the destination chain to see if a wrapped version of the
 * source token already exists, which helps avoid creating duplicate wrapped tokens.
 *
 * @param {Wormhole<Network>} wh - Wormhole SDK instance
 * @param {Chain} srcChain - Source chain identifier
 * @param {Chain} destChain - Destination chain identifier
 * @param {string} tokenAddress - Token address on the source chain
 * @returns {Promise<TokenAddress<Chain>|UniversalAddress|null>} The wrapped token address if it exists, null otherwise
 */
export const isTokenWrapped = async (
  wh: Wormhole<Network>,
  srcChain: Chain,
  destChain: Chain,
  tokenAddress: string,
): Promise<TokenAddress<Chain> | UniversalAddress | null> => {
  try {
    // Convert token to TokenId format
    const tokenId = Wormhole.tokenId(srcChain, tokenAddress);
    const destChainContext = wh.getChain(destChain);
    const tbDest = await destChainContext.getTokenBridge();

    // Check if the token is already wrapped
    const wrapped = await tbDest.getWrappedAsset(tokenId);
    return wrapped;
  } catch (_) {
    // If an error occurs, the token is not wrapped
    return null;
  }
};

/**
 * Creates a wrapped token on the destination chain
 *
 * This function performs the following steps:
 * 1. Checks if the token is already wrapped on the destination chain
 * 2. If not wrapped, creates an attestation on the source chain (Solana)
 * 3. Waits for the attestation to be processed by Wormhole guardians
 * 4. Submits the attestation to the destination chain to create the wrapped token
 * 5. Polls for the wrapped token to be available on the destination chain
 *
 * @param {CreateWrappedTokenInput} input - Parameters for creating the wrapped token
 * @param {Chain} input.destinationChain - The target blockchain where the wrapped token will be created
 * @param {string} input.tokenAddress - The address of the token on Solana to be wrapped
 * @param {Network} input.network - The network to use ("Mainnet", "Testnet", or "Devnet")
 *
 * @returns {Promise<CreateWrappedTokenResponse>} Response with the wrapped token information
 *
 * @throws Will throw an error if the wrapped token creation fails at any step
 */
export const createWrappedToken = async (
  input: CreateWrappedTokenInput,
): Promise<CreateWrappedTokenResponse> => {
  try {
    const { destinationChain, tokenAddress, network } = input;
    const gasLimit = BigInt(2_500_000);

    // Initialize the Wormhole SDK with all platforms
    const wh = await wormhole(network || "Mainnet", [evm, solana, sui, aptos]);

    // Get chain contexts
    const srcChain = wh.getChain("Solana");
    const destChain = wh.getChain(destinationChain);

    // Check if token is already wrapped
    const wrapped = await isTokenWrapped(
      wh,
      "Solana",
      destinationChain,
      tokenAddress,
    );
    if (wrapped) {
      return {
        success: true,
        wrappedToken: {
          chain: destinationChain,
          address: wrapped,
        },
      };
    }

    // Destination chain signer setup
    const { signer: destSigner } = await getSigner(destChain, gasLimit);
    const tbDest = await destChain.getTokenBridge();

    // Source chain signer setup
    const { signer: origSigner } = await getSigner(srcChain);

    // Create an attestation transaction on the source chain
    const tbOrig = await srcChain.getTokenBridge();

    // Parse the address properly for the source chain
    const parsedTokenAddress = Wormhole.parseAddress(
      srcChain.chain,
      tokenAddress,
    );
    const signerAddress = Wormhole.parseAddress(
      origSigner.chain(),
      origSigner.address(),
    );

    // Create the attestation transaction
    const attestTxns = tbOrig.createAttestation(
      parsedTokenAddress,
      signerAddress,
    );

    // Sign and send the attestation transaction
    const txids = await signSendWait(srcChain, attestTxns, origSigner);
    const txid = txids[0]!.txid;

    // Retrieve the Wormhole message ID from the attestation transaction
    const msgs = await srcChain.parseTransaction(txid);

    if (!msgs || msgs.length === 0) {
      throw new Error("No messages found in the transaction");
    }

    // Wait for the VAA to be available
    const timeout = 25 * 60 * 1000;
    const vaa = await wh.getVaa(msgs[0]!, "TokenBridge:AttestMeta", timeout);
    if (!vaa) {
      throw new Error(
        "VAA not found after retries exhausted. Try extending the timeout.",
      );
    }

    // Submit the attestation on the destination chain
    const subAttestation = tbDest.submitAttestation(
      vaa,
      Wormhole.parseAddress(destSigner.chain(), destSigner.address()),
    );

    const tsx = await signSendWait(destChain, subAttestation, destSigner);

    // Poll for the wrapped asset until it's available
    let wrappedAsset = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!wrappedAsset && attempts < maxAttempts) {
      try {
        // Convert token to TokenId format
        const tokenId = Wormhole.tokenId(srcChain.chain, tokenAddress);
        wrappedAsset = await tbDest.getWrappedAsset(tokenId);
      } catch (_) {
        attempts++;
        // Wait 2 seconds between attempts
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!wrappedAsset) {
      throw new Error("Failed to get wrapped asset after multiple attempts");
    }

    return {
      success: true,
      wrappedToken: {
        chain: destinationChain,
        address: wrappedAsset,
      },
      attestationTxid: txid,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};
