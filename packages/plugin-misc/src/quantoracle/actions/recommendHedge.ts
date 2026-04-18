import { Action } from "solana-agent-kit";
import { z } from "zod";
import { recommendHedge } from "../tools";

const recommendHedgeAction: Action = {
  name: "QUANTORACLE_RECOMMEND_HEDGE",
  description:
    "Rank the cheapest effective hedges for a given position (long stock, long crypto, etc.). Compares protective puts, collars, futures shorts, and partial hedges with cost, protection level, and affordability. PAID-ONLY — $0.04 per call via x402.",
  similes: [
    "how should i hedge my long position",
    "recommend cheapest hedge for my stock",
    "compare protective put vs collar",
    "suggest hedge strategy",
    "protect my portfolio",
  ],
  examples: [
    [
      {
        input: {
          position_type: "long_stock",
          position_value: 50000,
          asset_price: 100,
          volatility: 0.25,
          time_horizon_days: 30,
        },
        output: {
          recommended: "collar",
          hedges: [
            { type: "collar", cost_usd: 258.2, protection: "floor at 95, cap at 110" },
            { type: "protective_put", cost_usd: 439.15 },
          ],
        },
        explanation: "A collar costing $258 is recommended over a $439 protective put.",
      },
    ],
  ],
  schema: z.object({
    position_type: z.enum(["long_stock", "short_stock", "long_crypto", "long_options"]),
    position_value: z.number().positive(),
    asset_price: z.number().positive(),
    volatility: z.number().positive().describe("Annualized volatility"),
    time_horizon_days: z.number().int().positive().optional().describe("Default 30"),
    max_hedge_cost_pct: z.number().positive().optional().describe("Default 0.05 (5% of position)"),
    r: z.number().optional().describe("Default 0.05"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await recommendHedge(agent, input as any);
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

export default recommendHedgeAction;
