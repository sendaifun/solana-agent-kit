import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  InstructionData,
  withExecuteTransaction,
  getGovernanceProgramVersion,
} from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Execute a transaction from an approved proposal.
 *
 * @param agent               The SolanaAgentKit instance.
 * @param realmId             The public key of the realm as a string.
 * @param governanceId        The public key of the governance as a string.
 * @param proposalId          The public key of the proposal as a string.
 * @param transactionAddress  The public key of the transaction as a string.
 * @param transactionInstructions The instructions of the transaction.
 * @returns                   The signature of the transaction.
 */
export async function executeApprovedTreasuryActions(
  agent: SolanaAgentKit,
  realmId: string,
  governanceId: string,
  proposalId: string,
  transactionAddress: string,
  transactionInstructions: InstructionData[],
): Promise<string> {
  const connection = agent.connection;
  const realmPublicKey = new PublicKey(realmId);
  const governancePublicKey = new PublicKey(governanceId);
  const proposalPublicKey = new PublicKey(proposalId);
  const transactionPublicKey = new PublicKey(transactionAddress);
  const governanceProgramId = new PublicKey(
    "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
  );

  try {
    // Fetch the program version
    const programVersion = await getGovernanceProgramVersion(
      connection,
      governanceProgramId,
    );

    // Prepare transaction and instructions
    const transaction = new Transaction();
    const instructions: TransactionInstruction[] = [];

    await withExecuteTransaction(
      instructions,
      governanceProgramId,
      programVersion,
      governancePublicKey,
      proposalPublicKey,
      transactionPublicKey,
      transactionInstructions,
    );

    transaction.add(...instructions);

    // Send and confirm the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      agent.wallet,
    ]);

    return signature;
  } catch (error: any) {
    throw new Error(
      `Failed to execute approved treasury actions: ${error.message}`,
    );
  }
}
