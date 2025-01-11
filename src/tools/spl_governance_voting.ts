import { PublicKey, Transaction } from "@solana/web3.js";
// import { SplGovernance } from "governance-idl-sdk";
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
 * @param realmId      Address of the realm
 * @param proposalId   Address of the proposal
 * @param voteType     Type of vote to cast. Allowed values: 'yes', 'no'
 * @returns            Transaction signature
 */

export async function cast_proposal_vote(
  agent: SolanaAgentKit,
  realmId: string,
  proposalId: string,
  voteType: "yes" | "no",
) {
  try {
    const realmPublicKey = new PublicKey(realmId);
    const proposalPublicKey = new PublicKey(proposalId);

    if (
      !PublicKey.isOnCurve(realmPublicKey) ||
      !PublicKey.isOnCurve(proposalPublicKey)
    ) {
      throw new Error("Invalid realmId or proposalId");
    }

    const connection = agent.connection;
    const governanceId = new PublicKey(
      "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    );
    const programVersion = await getGovernanceProgramVersion(
      connection,
      governanceId,
    );
    const realmInfo = await getRealm(connection, realmPublicKey);
    const governingTokenMint = realmInfo.account.communityMint;

    const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
      governanceId,
      realmPublicKey,
      governingTokenMint,
      agent.wallet.publicKey,
    );

    const voteRecordAddress = await getVoteRecordAddress(
      governanceId,
      proposalPublicKey,
      tokenOwnerRecordAddress,
    );

    const proposal = await getProposal(connection, proposalPublicKey);
    const proposalTokenOwnerRecordAddress = proposal.account.tokenOwnerRecord;

    const vote = new Vote({
      voteType: voteType === "no" ? VoteKind.Deny : VoteKind.Approve,
      approveChoices: [
        new VoteChoice({
          rank: 0,
          weightPercentage: 100,
        }),
      ],
      deny: voteType === "no",
      veto: false,
    });

    const transaction = new Transaction();

    await withCastVote(
      transaction.instructions,
      governanceId,
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

    transaction.sign(agent.wallet);

    const signature = await agent.connection.sendRawTransaction(
      transaction.serialize(),
      {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      },
    );

    const latestBlockhash = await agent.connection.getLatestBlockhash();
    await agent.connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return {
      status: "success",
      signature: signature,
    };
  } catch (error: any) {
    console.error("Error casting vote:", error);
    throw new Error(`Unable to cast vote: ${error.message}`);
  }
}
