import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { stakeWithSolayer } from "../../tools";

const stakeWithSolayerAction: Action = {
  name: "STAKE_WITH_SOLAYER",
  similes: [
    "stake sol",
    "solayer sol",
    "ssol",
    "stake with solayer",
    "solayer restaking",
    "solayer staking",
    "stake with sol",
    "liquid staking solayer",
    "get solayer sol",
    "solayer sol restaking",
    "solayer sol staking",
  ],
  description:
    "Stake native SOL with Solayer's restaking protocol to receive Solayer SOL (sSOL)",
  examples: [
    [
      {
        input: {
          amount: 1.0,
        },
        output: {
          status: "success",
          signature: "3FgHn9...",
          message: "Successfully staked 1.0 SOL for Solayer SOL (sSOL)",
        },
        explanation: "Stake 1.0 SOL to receive Solayer SOL (sSOL)",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive().describe("Amount of SOL to stake"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const amount = input.amount as number;

      const res = await stakeWithSolayer(agent, amount);
      return {
        status: "success",
        res,
        message: `Successfully staked ${amount} SOL for Solayer SOL (sSOL)`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Solayer staking failed: ${error.message}`,
      };
    }
  },
};

export default stakeWithSolayerAction;
