import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { blueprintGetValidator } from "../tools";

export const blueprintGetValidatorAction: Action = {
  name: "GET_BLUEPRINT_VALIDATOR_INFO",
  similes: [
    "get Blueprint validator info",
    "check Blueprint APY",
    "Blueprint validator stats",
    "Blueprint staking APY",
  ],
  description:
    "Get Blueprint validator information including live APY (~6%), vote success rate, active stake, commission, and infrastructure details. Use this to evaluate the validator before staking.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Blueprint validator info fetched",
          name: "Blueprint",
          totalApy: 6.1,
          voteSuccess: 99.8,
        },
        explanation: "Get live stats for Blueprint validator",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (_agent: SolanaAgentKit, _input: Record<string, any>) => {
    try {
      const data = await blueprintGetValidator();

      return {
        status: "success",
        message: "Blueprint validator info fetched",
        ...data,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Blueprint validator info: ${error.message}`,
      };
    }
  },
};
