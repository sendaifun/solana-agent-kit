import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { blueprintStake } from "../tools";

export const blueprintStakeAction: Action = {
  name: "STAKE_SOL_WITH_BLUEPRINT",
  similes: [
    "stake SOL with Blueprint",
    "native stake SOL",
    "delegate SOL to Blueprint validator",
    "stake SOL natively",
    "stake with Blueprint validator",
  ],
  description:
    "Stake SOL natively with Blueprint validator (~6% APY). Zero custody — transaction is signed locally. This is native staking (not liquid staking), your wallet retains full authority over the stake account.",
  examples: [
    [
      {
        input: {
          amountSol: 10,
        },
        output: {
          status: "success",
          message: "Successfully staked 10 SOL with Blueprint validator",
          signature: "5abc...def",
        },
        explanation:
          "Stake 10 SOL natively with Blueprint validator at ~6% APY",
      },
    ],
  ],
  schema: z.object({
    amountSol: z
      .number()
      .positive()
      .describe("Amount of SOL to stake with Blueprint validator"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await blueprintStake(agent, input.amountSol);

      return {
        status: "success",
        message: `Successfully staked ${input.amountSol} SOL with Blueprint validator`,
        signature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Blueprint staking failed: ${error.message}`,
      };
    }
  },
};
