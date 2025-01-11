import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import { getProposal } from "@solana/spl-governance";

/**
 * Get detailed voting outcome for a specific governance proposal
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param proposalAccount {PublicKey} The public key of the proposal account
 *
 * @returns {Promise<Object>} Object containing:
 * - state: Current proposal state
 * - yesVotes: Number of approve votes
 * - noVotes: Number of deny votes
 * - abstainVotes: Number of abstain votes
 * - vetoVotes: Weight of veto votes
 * - isVoteFinalized: Whether voting has concluded
 * - name: Proposal name
 * - description: Link to proposal description
 * - votingStartedAt: Timestamp when voting started
 * - votingCompletedAt: Timestamp when voting completed
 * - signatoriesCount: Number of required signatories
 * - signatoriesSignedOff: Number of signatories who signed
 *
 * @throws {Error} If proposal account is invalid
 * @throws {Error} If proposal is not found
 *
 * @example
 * const outcome = await getVotingOutcome(
 *   agent,
 *   new PublicKey("proposal-address")
 * );
 */
export async function getVotingOutcome(
  agent: SolanaAgentKit,
  proposalAccount: PublicKey,
): Promise<{
  state: string;
  yesVotes: string;
  noVotes: string;
  abstainVotes: string;
  vetoVotes: string;
  isVoteFinalized: boolean;
  name: string;
  description: string;
  votingStartedAt: number | null;
  votingCompletedAt: number | null;
  signatoriesCount: number;
  signatoriesSignedOff: number;
}> {
  // Validate proposal account
  if (!PublicKey.isOnCurve(proposalAccount.toBytes())) {
    throw new Error("Invalid proposal account address");
  }

  try {
    const connection = agent.connection;

    // Get proposal data using supported API
    const proposalData = await getProposal(connection, proposalAccount);

    if (!proposalData) {
      throw new Error("Proposal not found");
    }

    const proposal = proposalData.account;

    return {
      state: proposal.state.toString(),
      yesVotes: proposal.getYesVoteCount().toString(),
      noVotes: proposal.getNoVoteCount().toString(),
      abstainVotes: proposal.abstainVoteWeight?.toString() || "0",
      vetoVotes: proposal.vetoVoteWeight.toString(),
      isVoteFinalized: proposal.isVoteFinalized(),
      name: proposal.name,
      description: proposal.descriptionLink,
      votingStartedAt: proposal.votingAt?.toNumber() || null,
      votingCompletedAt: proposal.votingCompletedAt?.toNumber() || null,
      signatoriesCount: proposal.signatoriesCount,
      signatoriesSignedOff: proposal.signatoriesSignedOffCount,
    };
  } catch (error: any) {
    throw new Error(`Failed to get voting outcome: ${error.message}`);
  }
}
