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
 * @param realmId      Realm Address
 * @param proposalId   Address of created proposal on which voting happens
 * @param voteType     Type of vote("yes"/"no")
 * @returns            signature of vote cast transaction
 */

export async function cast_proposal_vote(
  agent: SolanaAgentKit,
  realmId: string,
  proposalId: string,
  voteType: string,
) {
  try {
    if (!["yes", "no"].includes(voteType.toLowerCase())) {
      throw new Error("Invalid voteType. Allowed values: 'yes', 'no'");
    }

    if (!PublicKey.isOnCurve(realmId) || !PublicKey.isOnCurve(proposalId)) {
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
    const realm = new PublicKey(realmId);
    const realmInfo = await getRealm(connection, realm);
    const governingTokenMint = realmInfo.account.communityMint;

    const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
      governanceId,
      realm,
      governingTokenMint,
      agent.wallet.publicKey,
    );

    const voteRecordAddress = await getVoteRecordAddress(
      governanceId,
      new PublicKey(proposalId),
      tokenOwnerRecordAddress,
    );
    const proposal = await getProposal(connection, new PublicKey(proposalId));
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
      realm,
      proposal.account.governance,
      new PublicKey(proposalId),
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
    console.error(error);
    throw new Error(`Unable to cast vote: ${error.message}`);
  }
}
