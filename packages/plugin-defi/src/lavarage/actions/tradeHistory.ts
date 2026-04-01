import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageTradeHistory } from "../tools";

export const lavarageTradeHistoryAction: Action = {
  name: "LAVARAGE_TRADE_HISTORY",
  similes: ["trade history", "past trades", "trading history", "show my trades"],
  description: `Get your trade history — every open, close, liquidation, and repay event with PnL, fees, and TX signatures.`,
  examples: [[{
    input: { limit: 5 },
    output: { status: "success", total: 100, events: [] },
    explanation: "Get last 5 trade events.",
  }]],
  schema: z.object({
    limit: z.number().optional().default(20).describe("Max events to return"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await lavarageTradeHistory(agent, input.limit);
      return { status: "success", ...result };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};
