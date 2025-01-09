import { PublicKey, Transaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
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
  getTokenOwnerRecordsByOwner,
} from "@solana/spl-governance";
import { BN } from "@coral-xyz/anchor";

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
export async function castGovernanceVote(
  agent: SolanaAgentKit,
  realmAccount: PublicKey,
  proposalAccount: PublicKey,
  voteType: "yes" | "no",
): Promise<string> {
  try {
    const connection = agent.connection;
    const governanceProgramId = new PublicKey(
      "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    );

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

/**
 * Get current voting power for a wallet in a realm
 */
export async function getVotingPower(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governingTokenMint: PublicKey,
): Promise<{
  votingPower: number;
  delegatedPower: number;
  totalPower: number;
}> {
  try {

    const connection = agent.connection;
    const GOVERNANCE_PROGRAM_ID =
      "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw";
    const programId = new PublicKey(GOVERNANCE_PROGRAM_ID);
    const ownerRecordsbyOwner = await getTokenOwnerRecordsByOwner(
      connection,
      programId,
      agent.wallet_address,
    );

    // Get token holding data
    const tokenHolding = await governance.getTokenOwnerRecordByOwner(
      realm,
      governingTokenMint,
      agent.wallet_address,
    );

    if (!tokenHolding) {
      return { votingPower: 0, delegatedPower: 0, totalPower: 0 };
    }

    return {
      votingPower: tokenHolding.governingTokenDepositAmount.toNumber(),
      delegatedPower: tokenHolding.totalDelegatedVoterWeight.toNumber(),
      totalPower: tokenHolding.governingTokenDepositAmount
        .add(tokenHolding.totalDelegatedVoterWeight)
        .toNumber(),
    };
  } catch (error: any) {
    throw new Error(`Failed to get voting power: ${error.message}`);
  }
}

/**
 * Delegate voting power to another wallet
 */
export async function delegateVotingPower(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governingTokenMint: PublicKey,
  delegate: PublicKey,
): Promise<string> {
  try {
    const governance = new SplGovernance(agent.connection);

    const instruction = await governance.setGovernanceDelegate(
      realm,
      governingTokenMint,
      agent.wallet_address,
      delegate,
    );

    const signature = await agent.connection.sendTransaction(instruction, [
      agent.wallet,
    ]);
    return signature;
  } catch (error: any) {
    throw new Error(`Failed to delegate voting power: ${error.message}`);
  }
}

/**
 * Remove voting power delegation
 */
export async function removeDelegation(
  agent: SolanaAgentKit,
  realm: PublicKey,
  governingTokenMint: PublicKey,
): Promise<string> {
  try {
    const governance = new SplGovernance(agent.connection);

    const instruction = await governance.setGovernanceDelegate(
      realm,
      governingTokenMint,
      agent.wallet_address,
      null, // Passing null removes delegation
    );

    const signature = await agent.connection.sendTransaction(instruction, [
      agent.wallet,
    ]);
    return signature;
  } catch (error: any) {
    throw new Error(`Failed to remove delegation: ${error.message}`);
  }
}

/**
 * Get voting outcome for a specific proposal
 */
export async function getVotingOutcome(
  agent: SolanaAgentKit,
  proposal: PublicKey,
): Promise<{
  status: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  isFinalized: boolean;
  votingEndTime: number;
}> {
  try {
    const governance = new SplGovernance(agent.connection);
    const proposalData = await governance.getProposalByPubkey(proposal);

    if (!proposalData) {
      throw new Error("Proposal not found");
    }

    return {
      status: proposalData.state,
      yesVotes: proposalData.getYesVoteCount().toNumber(),
      noVotes: proposalData.getNoVoteCount().toNumber(),
      abstainVotes: proposalData.getAbstainVoteCount().toNumber(),
      isFinalized: proposalData.isVoteFinalized(),
      votingEndTime: proposalData.votingEndTime.toNumber(),
    };
  } catch (error: any) {
    throw new Error(`Failed to get voting outcome: ${error.message}`);
  }
}
