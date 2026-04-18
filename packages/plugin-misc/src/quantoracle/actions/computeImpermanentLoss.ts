import { Action } from "solana-agent-kit";
import { z } from "zod";
import { computeImpermanentLoss } from "../tools";

const computeImpermanentLossAction: Action = {
  name: "QUANTORACLE_IMPERMANENT_LOSS",
  description:
    "Calculate impermanent loss for a Uniswap v2 or v3 LP position given a price ratio change. For v3, provide the concentrated range. $0.005 per call via x402 past the free tier.",
  similes: [
    "calculate impermanent loss",
    "il for my uniswap position",
    "amm liquidity provider loss",
    "lp divergence loss",
    "how much did i lose as an lp",
  ],
  examples: [
    [
      {
        input: { current_price_ratio: 2.0, initial_value: 10000, pool_type: "v2" },
        output: { il_pct: -5.72, final_value: 9428 },
        explanation: "If the price of one token doubles, a Uniswap v2 LP loses 5.72% vs HODL.",
      },
    ],
  ],
  schema: z.object({
    current_price_ratio: z.number().positive().describe("current_price / initial_price"),
    initial_value: z.number().positive().optional().describe("Default 10000"),
    pool_type: z.enum(["v2", "v3"]).optional().describe("Default v2"),
    range_low: z.number().optional().describe("v3 only: lower price bound"),
    range_high: z.number().optional().describe("v3 only: upper price bound"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await computeImpermanentLoss(agent, input as any);
      return { status: "success", result };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is not a property of unknown
        message: e.message,
      };
    }
  },
};

export default computeImpermanentLossAction;
