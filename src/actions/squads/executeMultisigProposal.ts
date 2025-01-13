import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { multisig_execute_proposal } from "../../tools";

const executeMultisigProposalAction: Action = {
  name: "EXECUTE_MULTISIG_PROPOSAL_ACTION",
  similes: [
    "execute proposal",
    "execute proposal to transfer funds",
    "execute proposal to transfer funds from 2-of-2 multisig",
    "execute proposal to transfer funds from 2-of-2 multisig account",
    "execute proposal to transfer funds from 2-of-2 multisig account on Solana",
  ],
  description: `Execute a proposal to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.`,
  examples: [
    [
      {
        input: {
          proposalIndex: 0,
        },
        output: {
          status: "success",
          message: "Proposal executed successfully",
          transaction: "4xKpN2...",
          proposalIndex: "0",
        },
        explanation:
          "Execute a proposal to transfer 1 SOL from 2-of-2 multisig account on Solana",
      },
    ],
  ],
  schema: z.object({
    proposalIndex: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const proposalIndex =
      input.proposalIndex !== undefined
        ? Number(input.proposalIndex)
        : undefined;

    const multisig = await multisig_execute_proposal(agent, proposalIndex);

    return {
      status: "success",
      message: "Proposal executed successfully",
      transaction: multisig,
      proposalIndex,
    };
  },
};

export default executeMultisigProposalAction;
