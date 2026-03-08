import {
  type PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Deposit assets into a Governance Treasury
 * @param agent SolanaAgentKit instance
 * @param treasury Governance treasury (or governance account) public key
 * @param amount Amount to deposit
 * @param mint Optional token mint (defaults to Native SOL)
 * @returns Transaction signature
 */
export async function governanceDepositTreasury(
  agent: SolanaAgentKit,
  treasury: PublicKey,
  amount: number,
  mint?: PublicKey,
) {
  try {
    const transaction = new Transaction();

    if (!mint || mint.toBase58() === "So11111111111111111111111111111111111111112") {
      // Native SOL Transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: agent.wallet.publicKey,
          toPubkey: treasury,
          lamports: amount * 10 ** 9,
        }),
      );
    } else {
      // SPL Token Transfer
      const sourceAta = await getAssociatedTokenAddress(mint, agent.wallet.publicKey);
      const destinationAta = await getAssociatedTokenAddress(mint, treasury, true); // true for allowOwnerOffCurve (governance accounts are PDAs)

      transaction.add(
        createTransferInstruction(
          sourceAta,
          destinationAta,
          agent.wallet.publicKey,
          amount, // Note: This assumes decimals are handled by the caller or fetched
          [],
          TOKEN_PROGRAM_ID,
        ),
      );
    }

    const { blockhash } = await agent.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = agent.wallet.publicKey;

    return await signOrSendTX(agent, transaction);
  } catch (error: any) {
    throw new Error(`Governance deposit failed: ${error.message}`);
  }
}
