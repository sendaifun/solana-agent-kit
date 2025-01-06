import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { ManifestClient } from "@cks-systems/manifest-sdk";

/**
 * Withdraws all funds from Manifest
 * @param agent SolanaAgentKit instance
 * @param marketId Public key for the manifest market
 * @returns Transaction signature
 */
export async function withdrawAll(
  agent: SolanaAgentKit,
  marketId: PublicKey,
): Promise<string> {
  try {
    const mfxClient = await ManifestClient.getClientForMarket(
      agent.connection,
      marketId,
      agent.wallet,
    );

    const withdrawAllIx = await mfxClient.withdrawAllIx();
    const signature = await sendAndConfirmTransaction(
      agent.connection,
      new Transaction().add(...withdrawAllIx),
      [agent.wallet],
    );

    return signature;
  } catch (error: any) {
    throw new Error(`Withdraw all failed: ${error.message}`);
  }
}
