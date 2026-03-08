import {
  type PublicKey,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import {
  getGovernanceProgramVersion,
  withCreateProposal,
  withAddSignatory,
  VoteType,
} from "@solana/spl-governance";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Create a new Proposal in SPL Governance
 * @param agent SolanaAgentKit instance
 * @param programId Governance program ID
 * @param realm Realm public key
 * @param governance Governance public key
 * @param tokenOwnerRecord Token owner record public key
 * @param name Name of the proposal
 * @param descriptionLink Link to the proposal description
 * @param governingTokenMint Mint of the governing token (default to SOL)
 * @returns Transaction signature
 */
export async function governanceCreateProposal(
  agent: SolanaAgentKit,
  programId: PublicKey,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey = new PublicKey("So11111111111111111111111111111111111111112"),
) {
  try {
    const instructions: TransactionInstruction[] = [];
    const programVersion = await getGovernanceProgramVersion(
      agent.connection,
      programId,
    );

    const proposalAddress = await withCreateProposal(
      instructions,
      programId,
      programVersion,
      realm,
      governance,
      tokenOwnerRecord,
      name,
      descriptionLink,
      governingTokenMint,
      agent.wallet.publicKey,
      0, // proposalIndex
      VoteType.SINGLE_CHOICE,
      ["Approve"],
      true, // useDenyOption
      agent.wallet.publicKey,
    );

    // Add creator as signatory
    await withAddSignatory(
      instructions,
      programId,
      programVersion,
      proposalAddress,
      tokenOwnerRecord,
      agent.wallet.publicKey,
      agent.wallet.publicKey,
      agent.wallet.publicKey,
    );

    const transaction = new Transaction().add(...instructions);
    const { blockhash } = await agent.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = agent.wallet.publicKey;

    return await signOrSendTX(agent, transaction);
  } catch (error: any) {
    throw new Error(`Governance create proposal failed: ${error.message}`);
  }
}
