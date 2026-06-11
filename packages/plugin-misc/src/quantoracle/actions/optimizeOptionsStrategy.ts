import { Action } from "solana-agent-kit";
import { z } from "zod";
import { optimizeOptionsStrategy } from "../tools";

const optimizeOptionsStrategyAction: Action = {
  name: "QUANTORACLE_OPTIONS_STRATEGY_OPTIMIZER",
  description:
    "Rank the top options strategies given a market outlook (bullish/bearish/neutral) and volatility view (rising/falling/stable). Returns ranked list of Long Call, Bull Call Spread, Iron Condor, Long Straddle, etc. — each with legs, max profit/loss, breakevens, and score. PAID-ONLY — $0.08 per call via x402.",
  similes: [
    "suggest the best options strategy",
    "what options play is best for a bullish outlook",
    "rank options strategies for rising vol",
    "recommend iron condor or straddle",
    "best options trade for my view",
  ],
  examples: [
    [
      {
        input: { S: 100, outlook: "bullish", vol_view: "rising", T: 0.25, sigma: 0.25 },
        output: {
          top_pick: "Long Call (ATM)",
          strategies: [
            { name: "Long Call (ATM)", net_debit: 5.6, max_loss: 5.6, breakeven: [105.6] },
            { name: "Bull Call Spread", net_debit: 2.16, max_profit: 2.84 },
          ],
        },
        explanation: "For a bullish/rising-vol view on a $100 stock, top pick is Long Call.",
      },
    ],
  ],
  schema: z.object({
    S: z.number().positive().describe("Spot price"),
    outlook: z.enum(["bullish", "bearish", "neutral"]),
    vol_view: z.enum(["rising", "falling", "stable"]).optional().describe("Default stable"),
    T: z.number().positive().describe("Time to expiration in years"),
    sigma: z.number().positive().describe("Current implied volatility"),
    r: z.number().optional().describe("Default 0.05"),
    q: z.number().optional().describe("Default 0"),
    capital: z.number().positive().optional().describe("Default 10000"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await optimizeOptionsStrategy(agent, input as any);
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

export default optimizeOptionsStrategyAction;
