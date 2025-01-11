import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import { getProposal, Proposal } from "@solana/spl-governance";

/**
 * Get detailed voting outcome for a specific governance proposal
 *
 * @param agent {SolanaAgentKit} The Solana Agent Kit instance
 * @param proposalAccount {PublicKey} The public key of the proposal account
 *
 * @returns {Promise<Proposal>}
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
): Promise<Proposal> {
  try {
    const connection = agent.connection;

    // Get proposal data using supported API
    const proposalData = await getProposal(connection, proposalAccount);

    if (!proposalData) {
      throw new Error("Proposal not found");
    }

    const proposal = proposalData.account;

    return proposal;
  } catch (error: any) {
    throw new Error(`Failed to get voting outcome: ${error.message}`);
  }
}
