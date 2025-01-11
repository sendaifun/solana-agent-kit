import {
  PublicKey,
  Transaction,
  Signer,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getGovernanceProgramVersion,
  getTokenOwnerRecordAddress,
  getVoteRecordAddress,
  getProposal,
  Vote,
  VoteChoice,
  withCastVote,
  getRealm,
  VoteKind,
} from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Cast a vote on a given proposal.
 *
 * @param agent       The SolanaAgentKit instance.
 * @param realmId     The public key of the realm as a string.
 * @param proposalId  The public key of the proposal as a string.
 * @param voteType    The type of vote ("yes" or "no").
 * @returns           The transaction signature.
 */
export async function castProposalVote(
  agent: SolanaAgentKit,
  realmId: string,
  proposalId: string,
  voteType: string,
): Promise<string> {
  if (!["yes", "no"].includes(voteType.toLowerCase())) {
    throw new Error("Invalid voteType. Allowed values: 'yes', 'no'.");
  }

  const realmPublicKey = new PublicKey(realmId);
  const proposalPublicKey = new PublicKey(proposalId);
  const governanceProgramId = new PublicKey(
    "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
  );

  try {
    const connection = agent.connection;
    const programVersion = await getGovernanceProgramVersion(
      connection,
      governanceProgramId,
    );
    const realmInfo = await getRealm(connection, realmPublicKey);
    const governingTokenMint = realmInfo.account.communityMint;

    const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
      governanceProgramId,
      realmPublicKey,
      governingTokenMint,
      agent.wallet.publicKey,
    );

    const voteRecordAddress = await getVoteRecordAddress(
      governanceProgramId,
      proposalPublicKey,
      tokenOwnerRecordAddress,
    );

    const proposal = await getProposal(connection, proposalPublicKey);
    const proposalTokenOwnerRecordAddress = proposal.account.tokenOwnerRecord;

    const vote = new Vote({
      voteType:
        voteType.toLowerCase() === "no" ? VoteKind.Deny : VoteKind.Approve,
      approveChoices: [new VoteChoice({ rank: 0, weightPercentage: 100 })],
      deny: voteType.toLowerCase() === "no",
      veto: false,
    });

    const transaction = new Transaction();
    await withCastVote(
      transaction.instructions,
      governanceProgramId,
      programVersion,
      realmPublicKey,
      proposal.account.governance,
      proposalPublicKey,
      proposalTokenOwnerRecordAddress,
      tokenOwnerRecordAddress,
      proposal.account.governingTokenMint,
      voteRecordAddress,
      vote,
      agent.wallet.publicKey,
    );

    // Send and confirm the transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [agent.wallet as Signer],
      {
        preflightCommitment: "confirmed",
      },
    );

    return signature;
  } catch (error: any) {
    throw new Error(`Unable to cast vote: ${error.message}`);
  }
}
