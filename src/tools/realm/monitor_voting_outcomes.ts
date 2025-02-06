import { PublicKey } from "@solana/web3.js";
import { getProposal, ProgramAccount, Proposal } from "@solana/spl-governance";
import { SolanaAgentKit } from "../../agent";

/**
 * Monitors the voting outcome of a proposal.
 *
 * @param agent - SolanaAgentKit instance.
 * @param proposalId - PublicKey of the proposal to monitor.
 * @returns The final state of the proposal (e.g., 'Succeeded', 'Defeated').
 */
export async function monitorVotingOutcomes(
  agent: SolanaAgentKit,
  proposalId: PublicKey,
): Promise<ProgramAccount<Proposal>> {
  const proposal = await getProposal(agent.connection, proposalId);
  if (!proposal) {
    throw new Error("Proposal not found.");
  }
  // Return the status of the proposal
  return proposal;
}
