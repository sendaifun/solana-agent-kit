import { wormhole, CircleTransfer, amount } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import sui from "@wormhole-foundation/sdk/sui";
import aptos from "@wormhole-foundation/sdk/aptos";
import { getSigner } from "./helper";
import { CctpTransferInput } from "../../types";

// Main USDC transfer function using Circle's CCTP
/**
 * Executes a USDC transfer across different blockchains using Circle's Cross-Chain Transfer Protocol (CCTP)
 * via the Wormhole bridge infrastructure.
 *
 * @param input - Object containing transfer details (destination chain, amount, network)
 * @returns Object with transfer status and transaction details or error information
 */
export const cctpTransfer = async (input: CctpTransferInput) => {
  const { destinationChain, transferAmount, network = "Mainnet" } = input;
  const sourceChain = "Solana"; // Source chain is fixed to Solana
  const automatic = false; // Manual attestation mode (not using automatic relayers)
  const nativeGasAmount = 0; // No native gas provided for automatic transfers
  try {
    // Initialize the Wormhole SDK with supported blockchain adapters
    const wh = await wormhole(network, [evm, solana, sui, aptos]);

    // Get chain context objects for source and destination chains
    const sendChain = wh.getChain(sourceChain);
    const rcvChain = wh.getChain(destinationChain);

    // Retrieve wallet signers for both chains
    const src = await getSigner(sendChain);
    const dst = await getSigner(rcvChain);

    // Parse the transfer amount to the correct decimal precision (USDC uses 6 decimals)
    const amt = amount.units(amount.parse(transferAmount, 6));

    // Calculate native gas amount for automatic transfers (if enabled)
    // Currently not used as automatic is set to false
    const nativeGas =
      automatic && nativeGasAmount
        ? amount.units(amount.parse(nativeGasAmount, 6))
        : 0n;

    // Create a USDC transfer object with the specified parameters
    const xfer = await wh.circleTransfer(
      amt,
      src.address,
      dst.address,
      automatic,
      undefined, // No payload - optional data that can be attached to the transfer
      nativeGas,
    );

    // Get a cost estimate for the transfer (fees, gas, etc.)
    const quote = await CircleTransfer.quoteTransfer(
      src.chain,
      dst.chain,
      xfer.transfer,
    );

    // Initiate the transfer on the source chain
    const srcTxids = await xfer.initiateTransfer(src.signer);

    // For automatic transfers, the relay would handle attestation and completion
    // Since we're using manual mode, we need to handle these steps ourselves

    // Wait for the Circle attestation (proof that the tokens were locked on source chain)
    // Timeout after 60 seconds if no attestation is received
    const attestIds = await xfer.fetchAttestation(60_000);

    // Complete the transfer on the destination chain using the attestation
    const dstTxids = await xfer.completeTransfer(dst.signer);

    // Return a success response with all relevant transaction details
    return {
      success: true,
      status: "Completed",
      sourceChain: sourceChain,
      destinationChain: destinationChain,
      amount: transferAmount,
      sourceTransaction: srcTxids,
      attestation: attestIds,
      destinationTransaction: dstTxids,
      automatic: false,
    };
  } catch (error) {
    // Handle any errors that occur during the transfer process
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
