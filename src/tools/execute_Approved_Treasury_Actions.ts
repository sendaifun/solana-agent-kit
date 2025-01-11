import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
  Signer,
} from "@solana/web3.js";
import {
  InstructionData,
  withExecuteTransaction,
} from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Execute a transaction from a proposal.
 *
 * @param connection The connection to use to send the transaction.
 * @param programId The program id of the governance program.
 * @param programVersion The version of the governance program.
 * @param governance The account of the governance.
 * @param proposal The account of the proposal.
 * @param transactionAddress The address of the transaction.
 * @param transactionInstructions The instructions of the transaction.
 * @param executor The executor of the transaction.
 * @returns The signature of the transaction.
 */
export async function execute_approved_treasury_actions(
  agent: SolanaAgentKit,
  programId: PublicKey,
  programVersion: number,
  governance: PublicKey,
  proposal: PublicKey,
  transactionAddress: PublicKey,
  transactionInstructions: InstructionData[],
  executor: Signer,
) {
  try {
    const connection = agent.connection;
    const transaction = new Transaction();
    const instructions: TransactionInstruction[] = [];

    // Prepare the transaction instructions
    await withExecuteTransaction(
      instructions,
      programId,
      programVersion,
      governance,
      proposal,
      transactionAddress,
      transactionInstructions,
    );

    // Add the instructions to the transaction
    transaction.add(...instructions);

    // Send and confirm the transaction
    return await sendAndConfirmTransaction(connection, transaction, [executor]);
  } catch (error) {
    console.error("Failed to execute transaction:", error);
    throw error;
  }
}
