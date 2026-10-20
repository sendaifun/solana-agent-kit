import { type Action, type SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { pumpDataResultFields, pumpdataGetSimilar } from "../tools";

const pumpdataGetSimilarAction: Action = {
  name: "PUMPDATA_GET_SIMILAR",
  similes: [
    "pump.fun launches like this one",
    "similar pump.fun coins",
    "comparable launches",
    "pumpdata similar",
  ],
  description:
    "Costs $0.005 in USDC, paid over x402 from the agent's wallet. The past pump.fun launches most like this one at the same age, named by mint: the same deployer's prior launches first, then the nearest of the last 90 days by deployer record, first-10 s buyers, insiders' share and curve progress. For each, how it went over its next 24 h (peak and close as multiples, graduated or not) and why it is similar. What similar launches did, not a prediction.",
  examples: [
    [
      {
        input: {
          mint: "D27Lb9LA6D4dFpogGoXMXvZYkRsZ7UuctxAFpFQ3pump",
          limit: 5,
        },
        output: {
          status: "success",
          data: {
            comparables: [
              {
                mint: "EpcTN22u5u5qVM4DXzwWy67NCzp7WNwyS1hVf49Dpump",
                next_24h: { peak_mult: 7.24, close_mult: 0.0285 },
              },
            ],
          },
          paidUsd: 0.005,
        },
        explanation: "Five past launches like this one and their next 24 h",
      },
    ],
  ],
  schema: z.object({
    mint: z
      .string()
      .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "must be a base58 address")
      .describe("The pump.fun coin's mint address"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(25)
      .optional()
      .describe("How many comparable launches to return (default 10)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const response = await pumpdataGetSimilar(agent, input.mint, input.limit);
      return {
        status: "success",
        ...pumpDataResultFields(response),
        message: `pumpdata.fun comparable launches for ${input.mint} fetched.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch pumpdata.fun comparable launches: ${error.message}`,
      };
    }
  },
};

export default pumpdataGetSimilarAction;
