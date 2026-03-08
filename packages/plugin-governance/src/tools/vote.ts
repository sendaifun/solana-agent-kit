import {
  type PublicKey,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import {
  CastVote,
  Vote,
  getGovernanceProgramVersion,
  withCastVote,
} from "@solana/spl-governance";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Vote on a proposal in SPL Governance
 * @param agent SolanaAgentKit instance
 * @param programId Governance program ID
 * @param realm Realm public key
 * @param governance Governance public key
 * @param proposal Proposal public key
 * @param tokenOwnerRecord Token owner record public key
 * @param vote Vote type (Approve/Deny)
 * @returns Transaction signature
 */
export async function governanceVote(
  agent: SolanaAgentKit,
  programId: PublicKey,
  realm: PublicKey,
  governance: PublicKey,
  proposal: PublicKey,
  tokenOwnerRecord: PublicKey,
  vote: "approve" | "deny",
) {
  try {
    const instructions: TransactionInstruction[] = [];
    const programVersion = await getGovernanceProgramVersion(
      agent.connection,
      programId,
    );

    // Create Vote object
    const voteType = vote === "approve" ? Vote.fromApproval(100) : Vote.fromDeny();

    await withCastVote(
      instructions,
      programId,
      programVersion,
      realm,
      governance,
      proposal,
      tokenOwnerRecord,
      tokenOwnerRecord, // governingTokenOwnerRecord - assuming self for now
      agent.wallet.publicKey,
      new PublicKey("So11111111111111111111111111111111111111112"), // governingTokenMint - default to SOL
      voteType,
      agent.wallet.publicKey,
    );

    const transaction = new Transaction().add(...instructions);
    const { blockhash } = await agent.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = agent.wallet.publicKey;

    return await signOrSendTX(agent, transaction);
  } catch (error: any) {
    throw new Error(`Governance vote failed: ${error.message}`);
  }
}
