import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageGetPositionStatus } from "../tools";

export const lavarageGetPositionStatusAction: Action = {
  name: "LAVARAGE_GET_POSITION_STATUS",
  similes: [
    "get position status",
    "check position health",
    "position details",
    "position pnl",
    "is my position safe",
    "liquidation risk",
  ],
  description: `Get detailed status of a specific leveraged position — PnL, liquidation price, LTV, interest accrued, and current health.

Get the positionAddress from LAVARAGE_GET_POSITIONS first.`,
  examples: [
    [
      {
        input: {
          positionAddress: "6vMmSiMi6hSPJPUrkQ6fQKhCBvKnBi7P4BmSXYQ7brHm",
        },
        output: {
          status: "success",
          position: {
            baseTokenSymbol: "WBTC",
            quoteTokenSymbol: "USDC",
            unrealizedPnlUsd: 0.42,
            liquidationPrice: 50146.6,
            currentLtv: 0.76,
          },
        },
        explanation: "Check PnL and liquidation risk of a specific position.",
      },
    ],
  ],
  schema: z.object({
    positionAddress: z
      .string()
      .describe("Position account address (base58) — get from LAVARAGE_GET_POSITIONS"),
  }),
  handler: async (agent, input) => {
    try {
      const position = await lavarageGetPositionStatus(
        agent,
        input.positionAddress,
      );
      return { status: "success", position };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get position: ${error.message}`,
      };
    }
  },
};
