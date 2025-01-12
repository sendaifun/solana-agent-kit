import { PublicKey, Transaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
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
import { GOVERNANCE_PROGRAM_ADDRESS } from "../../constants";

/**
 * Cast a vote on a governance proposal
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param realmAccount {PublicKey} The public key of the realm
 * @param proposalAccount {PublicKey} The public key of the proposal being voted on
 * @param voteType {"yes" | "no"} Type of vote to cast
 *
 * @returns {Promise<string>} Transaction signature
 *
 * @throws Will throw an error if the vote transaction fails
 *
 * @example
 * const signature = await castVote(
 *   agent,
 *   new PublicKey("realm-address"),
 *   new PublicKey("proposal-address"),
 *   "yes"
 * );
 */
export async function castProposalVote(
  agent: SolanaAgentKit,
  realmAccount: PublicKey,
  proposalAccount: PublicKey,
  voteType: "yes" | "no",
): Promise<string> {
  try {
    const connection = agent.connection;
    const governanceProgramId = new PublicKey(GOVERNANCE_PROGRAM_ADDRESS);

    // Get governance program version for the connected chain
    const programVersion = await getGovernanceProgramVersion(
      connection,
      governanceProgramId,
    );

    // Fetch realm info and get governing token mint
    const realmInfo = await getRealm(connection, realmAccount);
    const governingTokenMint = realmInfo.account.communityMint;

    // Get voter's token owner record
    const tokenOwnerRecord = await getTokenOwnerRecordAddress(
      governanceProgramId,
      realmAccount,
      governingTokenMint,
      agent.wallet_address,
    );

    // Get voter's vote record
    const voteRecord = await getVoteRecordAddress(
      governanceProgramId,
      proposalAccount,
      tokenOwnerRecord,
    );

    // Get proposal data
    const proposal = await getProposal(connection, proposalAccount);

    // Construct vote object
    const vote = new Vote({
      voteType: voteType === "no" ? VoteKind.Deny : VoteKind.Approve,
      approveChoices:
        voteType === "yes"
          ? [new VoteChoice({ rank: 0, weightPercentage: 100 })]
          : [],
      deny: voteType === "no",
      veto: false,
    });

    // Create and configure transaction
    const transaction = new Transaction();

    await withCastVote(
      transaction.instructions,
      governanceProgramId,
      programVersion,
      realmAccount,
      proposal.account.governance,
      proposalAccount,
      proposal.account.tokenOwnerRecord,
      tokenOwnerRecord,
      proposal.account.governingTokenMint,
      voteRecord,
      vote,
      agent.wallet_address,
    );

    // Sign and send transaction
    transaction.sign(agent.wallet);
    const signature = await agent.connection.sendRawTransaction(
      transaction.serialize(),
      {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      },
    );

    // Confirm transaction
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return signature;
  } catch (error: any) {
    throw new Error(`Failed to cast governance vote: ${error.message}`);
  }
}