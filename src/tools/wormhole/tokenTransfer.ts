import solana from "@wormhole-foundation/sdk/solana";
import { getTokenDecimals, getSigner } from "./helper";
import evm from "@wormhole-foundation/sdk/evm";
import { TokenTransferInput } from "../../types";
import {
  wormhole,
  TokenId,
  Wormhole,
  amount,
  TokenTransfer,
  isTokenId,
} from "@wormhole-foundation/sdk";
import sui from "@wormhole-foundation/sdk/sui";
import aptos from "@wormhole-foundation/sdk/aptos";
import { createWrappedToken, isTokenWrapped } from "./createWrappedToken";

/**
 * Transfers tokens from Solana to another blockchain using the Wormhole protocol
 *
 * This function handles the cross-chain transfer of tokens, including:
 * - Native SOL transfers
 * - SPL token transfers
 * - Automatic token wrapping if the token doesn't exist on the destination chain
 *
 * @param {TokenTransferInput} input - The input parameters for the token transfer
 * @param {Chain} input.destinationChain - The target blockchain (e.g., "Ethereum", "BaseSepolia")
 * @param {Network} input.network - The network to use ("Mainnet", "Testnet", or "Devnet")
 * @param {string} input.transferAmount - The amount of tokens to transfer
 * @param {TokenId} [input.tokenAddress] - Optional token address to transfer (if not provided, native SOL is used)
 *
 * @returns {Promise<any>} A response object containing the transaction status and details
 *
 * @throws Will throw an error if the transfer fails for any reason
 */
export const tokenTransfer = async (
  input: TokenTransferInput,
): Promise<any> => {
  try {
    const { destinationChain, network, transferAmount, tokenAddress } = input;

    // Initialize the Wormhole SDK with all platforms
    const wh = await wormhole(network || "Mainnet", [evm, solana, sui, aptos]);

    // Ensure chain names are valid and properly formatted
    const sourceChainName = "Solana";
    const destChainName = destinationChain;

    // Get chain contexts - handle potential errors
    const sendChain = wh.getChain(sourceChainName);
    const source = await getSigner(sendChain);

    // Get destination chain
    const rcvChain = wh.getChain(destChainName);
    const destination = await getSigner(rcvChain);

    // Properly format the token as a TokenId
    let token: TokenId;

    if (!tokenAddress) {
      // Use native token if no token address is provided
      token = Wormhole.tokenId(sendChain.chain, "native");
    } else if (typeof tokenAddress === "string") {
      // Convert string token address to TokenId
      token = Wormhole.tokenId(sendChain.chain, tokenAddress);
    } else if (isTokenId(tokenAddress)) {
      // Use the TokenId directly
      token = tokenAddress;
    } else {
      // Default to native token if the format is unrecognized
      token = Wormhole.tokenId(sendChain.chain, "native");
    }

    // If a non-native token is being transferred, check if it's wrapped
    if (token.address !== "native") {
      const tokenAddressStr = token.address.toString();

      // Check if the token is already wrapped on the destination chain
      const isWrapped = await isTokenWrapped(
        wh,
        sourceChainName,
        destChainName,
        tokenAddressStr,
      );

      // If the token is not wrapped, create a wrapped token
      if (!isWrapped) {
        const wrappedTokenResult = await createWrappedToken({
          destinationChain: destChainName,
          tokenAddress: tokenAddressStr,
          network: network || "Testnet",
        });

        if (!wrappedTokenResult.success) {
          throw new Error(
            `Failed to create wrapped token: ${wrappedTokenResult.error}`,
          );
        }
      }
    }

    const amt = transferAmount ?? "0.01";
    const automatic = false;

    const decimals = await getTokenDecimals(wh, token, sendChain);

    // Create a TokenTransfer object to track the state of the transfer
    const xfer = await wh.tokenTransfer(
      token,
      amount.units(amount.parse(amt, decimals)),
      source.address,
      destination.address,
      automatic,
    );

    // Get a quote for the transfer
    const quote = await TokenTransfer.quoteTransfer(
      wh,
      source.chain,
      destination.chain,
      xfer.transfer,
    );

    if (xfer.transfer.automatic && quote.destinationToken.amount < 0) {
      throw "The amount requested is too low to cover the fee and any native gas requested.";
    }

    // Submit the transactions to the source chain
    const srcTxids = await xfer.initiateTransfer(source.signer);

    // If automatic, we're done
    if (automatic) {
      return {
        success: true,
        sourceTransactionIds: srcTxids,
        transferId: xfer.txids[0],
      };
    }

    // Wait for the VAA to be signed and ready
    let attestation = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!attestation && attempts < maxAttempts) {
      try {
        attestation = await xfer.fetchAttestation(60_000);
      } catch (_) {
        attempts++;
        // Wait 30 seconds between attempts
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }

    if (!attestation) {
      throw new Error("Failed to get attestation after multiple attempts");
    }

    // Redeem the VAA on the destination chain
    const destTxids = await xfer.completeTransfer(destination.signer);

    return {
      success: true,
      sourceTransactionIds: srcTxids,
      destinationTransactionIds: destTxids,
      transferId: xfer.txids[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
