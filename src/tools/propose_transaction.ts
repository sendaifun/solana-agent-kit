import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
  Signer,
} from "@solana/web3.js";
import { withCreateProposal, VoteType } from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Propose a transaction to the Solana governance program.
 *
 * @param connection The Solana RPC connection
 * @param programId The program ID of the governance program
 * @param programVersion The program version of the governance program
 * @param realm The realm public key
 * @param governance The governance public key
 * @param tokenOwnerRecord The token owner record public key
 * @param governingTokenMint The governing token mint public key
 * @param governanceAuthority The governance authority public key
 * @param payer The payer wallet
 * @param name The proposal name
 * @param descriptionLink The proposal description link
 * @param options The proposal options
 * @param useDenyOption Whether to use the deny option (default: true)
 * @param proposalIndex The proposal index (default: undefined)
 * @param voterWeightRecord The voter weight record public key (default: undefined)
 * @returns The proposal public key
 * @throws Error if the proposal fails
 */

export async function propose_transaction(
  agent: SolanaAgentKit,
  programId: PublicKey,
  programVersion: number,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  governingTokenMint: PublicKey,
  governanceAuthority: PublicKey,
  payer: Signer,
  name: string,
  descriptionLink: string,
  options: string[],
  voteType: VoteType,
  useDenyOption: boolean = true,
  proposalIndex?: number,
  voterWeightRecord?: PublicKey,
) {
  try {
    const connection = agent.connection;
    const transaction = new Transaction();
    const instructions: TransactionInstruction[] = [];

    // Create the proposal
    const proposalPublicKey = await withCreateProposal(
      instructions,
      programId,
      programVersion,
      realm,
      governance,
      tokenOwnerRecord,
      name,
      descriptionLink,
      governingTokenMint,
      governanceAuthority,
      proposalIndex,
      voteType,
      options,
      useDenyOption,
      payer.publicKey,
      voterWeightRecord,
    );

    // Add the instructions to the transaction
    transaction.add(...instructions);

    // Send and confirm the transaction
    await sendAndConfirmTransaction(connection, transaction, [payer]);

    return proposalPublicKey;
  } catch (error) {
    console.error("Failed to propose transaction:", error);
    throw error;
  }
}
