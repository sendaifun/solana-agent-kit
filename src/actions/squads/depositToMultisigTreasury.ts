import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { multisig_deposit_to_treasury } from "../../tools";

const depositToMultisigAction: Action = {
  name: "DEPOSIT_TO_MULTISIG_ACTION",
  similes: [
    "deposit to multisig",
    "deposit to squads multisig",
    "deposit to 2-of-2 multisig account",
    "deposit to 2-of-2 multisig account on Solana",
    "deposit SOL to 2-of-2 multisig",
    "deposit SPL tokens to 2-of-2 multisig",
  ],
  description: `Deposit funds to a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.`,
  examples: [
    [
      {
        input: {
          amount: 1,
        },
        output: {
          status: "success",
          message: "Funds deposited to 2-by-2 multisig account successfully",
          signature: "4xKpN2...",
        },
        explanation: "Deposit 1 SOL to 2-of-2 multisig account on Solana",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().min(0, "Amount must be greater than 0"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const multisig = await multisig_deposit_to_treasury(
      agent,
      input.amount as number,
    );

    return {
      status: "success",
      message: "Funds deposited to 2-by-2 multisig account successfully",
      signature: multisig,
    };
  },
};

export default depositToMultisigAction;
