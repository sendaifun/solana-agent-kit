import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealGetKlines } from "../tools";

export const byrealGetKlinesAction: Action = {
  name: "BYREAL_GET_KLINES",
  similes: [
    "byreal kline data",
    "byreal chart data",
    "byreal candlestick",
    "byreal OHLCV",
  ],
  description: "Get K-line (OHLCV) chart data for a Byreal pool",
  examples: [
    [
      {
        input: {
          poolAddress: "PoolAddr...",
          tokenAddress: "TokenAddr...",
          klineType: "1h",
        },
        output: {
          status: "success",
          data: [
            {
              timestamp: 1700000000,
              open: 150,
              high: 155,
              low: 148,
              close: 152,
              volume: 1000,
            },
          ],
        },
        explanation: "Get hourly K-line data for a Byreal pool",
      },
    ],
  ],
  schema: z.object({
    poolAddress: z.string().describe("The pool address"),
    tokenAddress: z.string().describe("The token mint address"),
    klineType: z
      .string()
      .describe("K-line interval: 1m, 3m, 5m, 15m, 30m, 1h, 4h, 12h, 1d"),
    startTime: z.number().optional().describe("Start timestamp in seconds"),
    endTime: z.number().optional().describe("End timestamp in seconds"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealGetKlines(agent, {
        poolAddress: input.poolAddress,
        tokenAddress: input.tokenAddress,
        klineType: input.klineType,
        startTime: input.startTime,
        endTime: input.endTime,
      });
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Byreal klines: ${error.message}`,
      };
    }
  },
};
