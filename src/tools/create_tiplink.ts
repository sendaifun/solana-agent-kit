import { TipLink } from "@tiplink/api";
import {
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

/**
 * Creates a TipLink and transfers the specified amount of SOL to the TipLink.
 * @param {SolanaAgentKit} agent - Instance of SolanaAgentKit, contains wallet and connection details.
 * @param {number} amountSol - The amount of SOL (in whole numbers) to transfer to the TipLink.
 * @returns {Promise<{url: string, signature: string}>}
 * - url: The generated TipLink URL for the recipient to claim funds.
 * - signature: The transaction signature of the SOL transfer.
 */
export async function create_TipLink(
  agent: SolanaAgentKit,
  amountSol: number,
): Promise<{
  url: string;
  signature: string;
}> {
  try {
    // Create a new TipLink
    const tiplink = await TipLink.create();

    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: agent.wallet_address,
        toPubkey: tiplink.keypair.publicKey,
        lamports: amountSol * LAMPORTS_PER_SOL,
      }),
    );

    const signature = await sendAndConfirmTransaction(
      agent.connection,
      transaction,
      [agent.wallet],
      { commitment: "confirmed" },
    );

    return {
      url: tiplink.url.toString(),
      signature,
    };
  } catch (error: any) {
    throw new Error(`Failed to create TipLink: ${error.message}`);
  }
}
