import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageGetPositions } from "../tools";

export const lavarageGetPositionsAction: Action = {
  name: "LAVARAGE_GET_POSITIONS",
  similes: [
    "get leverage positions",
    "list leveraged positions",
    "show margin positions",
    "my lavarage positions",
    "check open positions",
    "show leverage trades",
  ],
  description: `List all leveraged positions for your wallet on Lavarage. Shows token pair, leverage, entry price, PnL, liquidation price, and more.

Positions can be LONG (profit when price goes up), SHORT (profit when price goes down), or BORROW (no directional bet).`,
  examples: [
    [
      {
        input: { status: "OPEN" },
        output: {
          status: "success",
          positions: [
            {
              address: "6vMm...",
              side: "LONG",
              baseTokenSymbol: "WBTC",
              quoteTokenSymbol: "USDC",
              leverage: "3.000",
              unrealizedPnlUsd: 0.42,
            },
          ],
        },
        explanation: "List all open leveraged positions.",
      },
    ],
  ],
  schema: z.object({
    status: z
      .enum(["OPEN", "CLOSED", "ALL"])
      .optional()
      .default("OPEN")
      .describe("Filter by status (default: OPEN)"),
  }),
  handler: async (agent, input) => {
    try {
      const positions = await lavarageGetPositions(agent, input.status);
      return {
        status: "success",
        positions,
        count: Array.isArray(positions) ? positions.length : 0,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get positions: ${error.message}`,
      };
    }
  },
};
