import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { ManifestClient } from "@cks-systems/manifest-sdk";

/**
 * Cancels all orders from Manifest
 * @param agent SolanaAgentKit instance
 * @param marketId Public key for the manifest market
 * @returns Transaction signature
 */
export async function cancelAllOrders(
  agent: SolanaAgentKit,
  marketId: PublicKey,
): Promise<string> {
  try {
    const mfxClient = await ManifestClient.getClientForMarket(
      agent.connection,
      marketId,
      agent.wallet,
    );

    const cancelAllOrdersIx = await mfxClient.cancelAllIx();
    const signature = await sendAndConfirmTransaction(
      agent.connection,
      new Transaction().add(cancelAllOrdersIx),
      [agent.wallet],
    );

    return signature;
  } catch (error: any) {
    throw new Error(`Cancel all orders failed: ${error.message}`);
  }
}
