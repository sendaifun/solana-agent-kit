import { PublicKey } from "@solana/web3.js";
import { getProposal, ProposalState } from "@solana/spl-governance";
import { SolanaAgentKit } from "../agent";

/**
 * Monitor the voting outcome of a proposal.
 *
 * @param agent       The SolanaAgentKit instance.
 * @param proposalId  The public key of the proposal as a string.
 * @returns           The current state of the proposal.
 */
export async function monitorVotingOutcomes(
  agent: SolanaAgentKit,
  proposalId: string,
): Promise<string> {
  const proposalPublicKey = new PublicKey(proposalId);

  try {
    const proposal = await getProposal(agent.connection, proposalPublicKey);
    return ProposalState[proposal.account.state];
  } catch (error: any) {
    throw new Error(`Unable to monitor voting outcomes: ${error.message}`);
  }
}
