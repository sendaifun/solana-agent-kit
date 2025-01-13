import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { multisig_approve_proposal } from "../../tools";

const approveMultisigProposalAction: Action = {
  name: "APPROVE_MULTISIG_PROPOSAL_ACTION",
  similes: [
    "approve proposal",
    "approve proposal to transfer funds",
    "approve proposal to transfer funds from 2-of-2 multisig",
    "approve proposal to transfer funds from 2-of-2 multisig account",
    "approve proposal to transfer funds from 2-of-2 multisig account on Solana",
  ],
  description: `Approve a proposal to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
  
  Note: For one AI agent, only one 2-by-2 multisig can be created as it is pair-wise.`,
  examples: [
    [
      {
        input: {
          transactionIndex: 0,
        },
        output: {
          status: "success",
          message: "Proposal approved successfully",
          transaction: "4xKpN2...",
          transactionIndex: "0",
        },
        explanation:
          "Approve a proposal to transfer 1 SOL from 2-of-2 multisig account on Solana",
      },
    ],
  ],
  schema: z.object({
    transactionIndex: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const tx = await multisig_approve_proposal(agent, input.transactionIndex);

    return {
      status: "success",
      message: "Proposal approved successfully",
      transaction: tx,
      transactionIndex: input.transactionIndex.toString(),
    };
  },
};

export default approveMultisigProposalAction;
