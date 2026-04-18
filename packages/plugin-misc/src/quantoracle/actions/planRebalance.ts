import { Action } from "solana-agent-kit";
import { z } from "zod";
import { planRebalance } from "../tools";

const planRebalanceAction: Action = {
  name: "QUANTORACLE_REBALANCE_PLAN",
  description:
    "Generate the exact trade list to move a portfolio from current holdings to target weights with transaction cost estimate. Returns buy/sell actions, total cost, drift before/after. PAID-ONLY — $0.05 per call via x402.",
  similes: [
    "generate rebalance trades",
    "rebalance my portfolio to target weights",
    "what trades to hit my target allocation",
    "drift correction trades",
    "compute rebalance orders with costs",
  ],
  examples: [
    [
      {
        input: {
          current_holdings: { AAPL: 50000, TSLA: 30000, GLD: 20000 },
          target_weights: { AAPL: 0.4, TSLA: 0.4, GLD: 0.2 },
        },
        output: {
          num_trades: 2,
          total_cost_usd: 20,
          trades: [
            { asset: "AAPL", action: "sell", amount_usd: 10000 },
            { asset: "TSLA", action: "buy", amount_usd: 10000 },
          ],
        },
        explanation: "Rebalance 50/30/20 to 40/40/20: sell $10k AAPL, buy $10k TSLA, cost $20.",
      },
    ],
  ],
  schema: z.object({
    current_holdings: z.record(z.number()).describe("Asset symbol -> current USD value"),
    target_weights: z.record(z.number()).describe("Asset symbol -> target weight (must sum to ~1.0)"),
    transaction_cost_bps: z.number().min(0).optional().describe("One-way cost in bps. Default 10"),
    min_trade_usd: z.number().min(0).optional().describe("Default 10"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await planRebalance(agent, input as any);
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

export default planRebalanceAction;
