import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageClosePosition } from "../tools";

export const lavarageClosePositionAction: Action = {
  name: "LAVARAGE_CLOSE_POSITION",
  similes: [
    "close leverage position",
    "close leveraged position",
    "close margin position",
    "close lavarage position",
    "sell leveraged position",
    "exit leverage trade",
  ],
  description: `Close a leveraged position on Lavarage. Sells the tokens, repays the borrow, returns collateral + profit (or minus loss).

Get the positionAddress from LAVARAGE_GET_POSITIONS first.`,
  examples: [
    [
      {
        input: {
          positionAddress: "6vMmSiMi6hSPJPUrkQ6fQKhCBvKnBi7P4BmSXYQ7brHm",
        },
        output: {
          status: "success",
          signature: "4RQjfHW6jEbKxzYM...",
          message: "Position closed",
        },
        explanation:
          "Close a leveraged position and receive remaining collateral.",
      },
    ],
  ],
  schema: z.object({
    positionAddress: z
      .string()
      .describe(
        "Position account address (base58) — get from LAVARAGE_GET_POSITIONS",
      ),
    slippageBps: z
      .number()
      .optional()
      .default(50)
      .describe("Slippage tolerance in basis points (default: 50)"),
  }),
  handler: async (agent, input) => {
    try {
      const signature = await lavarageClosePosition(
        agent,
        input.positionAddress,
        input.slippageBps,
      );
      return {
        status: "success",
        signature,
        message: `Position closed. TX: ${signature}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to close position: ${error.message}`,
      };
    }
  },
};
