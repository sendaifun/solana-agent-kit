import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaTokenDataByTickerAction: Action = {
  name: "solana_token_data_by_ticker",
  similes: ["get_token_data_by_ticker", "fetch_token_data_by_ticker"],
  description: `Get the token data for a given token ticker.

  Inputs:
  ticker: string, eg "USDC" (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                ticker: "SOL"
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            name: "Solana",
            symbol: "SOL",
            decimals: 9,
            supply: "1000000000"
          },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const tokenData = await agent.getTokenDataByTicker(input.ticker.trim());
    return {
      success: true,
      data: {
        tokenData
      }
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        ticker: z.string(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
