import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { stakeWithJup } from "../../tools";

const stakeWithJupAction: Action = {
  name: "STAKE_WITH_JUPITER",
  similes: [
    "stake sol",
    "stake with jupiter",
    "jup staking",
    "stake with jup",
    "liquid staking",
    "get jupsol",
  ],
  description:
    "Stake SOL tokens with Jupiter's liquid staking protocol to receive jupSOL",
  examples: [
    [
      {
        input: {
          amount: 1.5,
        },
        output: {
          status: "success",
          signature: "5KtPn3...",
          message: "Successfully staked 1.5 SOL for jupSOL",
        },
        explanation: "Stake 1.5 SOL to receive jupSOL tokens",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive().describe("Amount of SOL to stake"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const amount = input.amount as number;

      const res = await stakeWithJup(agent, amount);
      return {
        status: "success",
        res,
        message: `Successfully staked ${amount} SOL for jupSOL`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `jupSOL staking failed: ${error.message}`,
      };
    }
  },
};

export default stakeWithJupAction;
