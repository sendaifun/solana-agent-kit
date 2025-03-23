import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { stakeForToken, stakeWithJup } from "../../tools";

const stakeForTokenAction: Action = {
  name: "STAKE_FOR_TOKEN",
  similes: [
    "stake sol",
    "stake with jupiter",
    "jup staking",
    "stake with jup",
    "liquid staking",
    "get jupsol",
  ],
  description:
    "Stake SOL tokens with Jupiter's liquid staking protocol to receive specified token",
  examples: [
    [
      {
        input: {
          tokenMint: "jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v",
          amount: 1.5,
        },
        output: {
          status: "success",
          signature: "5KtPn3...",
          message: "Successfully staked 1.5 SOL for specified token",
        },
        explanation: "Stake 1.5 SOL to receive specified token",
      },
    ],
  ],
  schema: z.object({
    tokenMint: z.string().describe("Token to receive for staking"),
    amount: z.number().positive().describe("Amount of SOL to stake"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const tokenMint = input.tokenMint as string;
      const amount = input.amount as number;

      const res = await stakeForToken(agent, tokenMint, amount);
      return {
        status: "success",
        res,
        message: `Successfully staked ${amount} SOL for ${tokenMint}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Staking failed: ${error.message}`,
      };
    }
  },
};

export default stakeForTokenAction;
