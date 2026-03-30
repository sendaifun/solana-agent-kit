import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageListTokens } from "../tools";

export const lavarageListTokensAction: Action = {
  name: "LAVARAGE_LIST_TOKENS",
  similes: [
    "list leverage tokens",
    "search lavarage tokens",
    "what tokens can I leverage",
    "available leverage tokens",
    "show tradeable tokens",
    "find token for leverage",
  ],
  description: `Search for tokens available for leverage trading on Lavarage. Returns tokens with their best offer, current price, max leverage, and available liquidity.

The offerPublicKey from the results is needed to open a position via LAVARAGE_OPEN_POSITION.`,
  examples: [
    [
      {
        input: { search: "BTC" },
        output: {
          status: "success",
          tokens: [
            {
              symbol: "WBTC",
              offerPublicKey: "CfiY...",
              maxLeverage: "12.610",
              quoteSymbol: "USDC",
            },
          ],
        },
        explanation: "Search for BTC tokens available for leverage trading.",
      },
    ],
  ],
  schema: z.object({
    search: z
      .string()
      .min(1)
      .describe("Search by token name or symbol (e.g. 'BTC', 'SOL', 'BONK')"),
  }),
  handler: async (agent, input) => {
    try {
      const tokens = await lavarageListTokens(agent, input.search);
      return { status: "success", tokens, count: tokens.length };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to list tokens: ${error.message}`,
      };
    }
  },
};
