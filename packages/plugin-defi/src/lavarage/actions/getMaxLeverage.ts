import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageGetMaxLeverage } from "../tools";

export const lavarageGetMaxLeverageAction: Action = {
  name: "LAVARAGE_GET_MAX_LEVERAGE",
  similes: [
    "max leverage",
    "what leverage available",
    "leverage rates",
    "lending rates",
    "borrowing rates for leverage",
    "available liquidity for leverage",
  ],
  description: `Get max leverage, borrow APR, and available liquidity for tokens on Lavarage. Useful for finding the best offer before opening a position.

Optionally filter by quote currency (SOL or USDC).`,
  examples: [
    [
      {
        input: { search: "SOL", quoteCurrency: "USDC" },
        output: {
          status: "success",
          offers: [
            {
              symbol: "cbBTC",
              maxLeverage: "12.610",
              apr: "5.00",
              quoteSymbol: "USDC",
            },
          ],
        },
        explanation: "Find max leverage and rates for BTC tokens quoted in USDC.",
      },
    ],
  ],
  schema: z.object({
    search: z
      .string()
      .describe("Search by token name or symbol (e.g. 'BTC', 'SOL')"),
    quoteCurrency: z
      .enum(["SOL", "USDC", "all"])
      .optional()
      .default("all")
      .describe("Filter by quote currency (default: all)"),
  }),
  handler: async (agent, input) => {
    try {
      const offers = await lavarageGetMaxLeverage(
        agent,
        input.search,
        input.quoteCurrency,
      );
      return { status: "success", offers, count: offers.length };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get leverage info: ${error.message}`,
      };
    }
  },
};
