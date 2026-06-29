import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageIncreaseBorrow } from "../tools";

export const lavarageIncreaseBorrowAction: Action = {
  name: "LAVARAGE_INCREASE_BORROW",
  similes: [
    "increase borrow",
    "borrow more",
    "increase leverage",
    "compound position",
    "add leverage",
  ],
  description: `Increase the borrowed amount on a Lavarage position. Two modes:

- "withdraw": Borrow more quote tokens and receive them in your wallet.
- "compound": Borrow more and swap into the base token, increasing your position size (like adding leverage).`,
  examples: [
    [
      {
        input: {
          positionAddress: "6vMm...",
          additionalBorrowAmount: "1000000",
          mode: "withdraw",
        },
        output: { status: "success", signature: "2AYJ..." },
        explanation: "Borrow 1 USDC more from the lending pool.",
      },
    ],
  ],
  schema: z.object({
    positionAddress: z.string().describe("Position address (base58)"),
    additionalBorrowAmount: z
      .string()
      .describe("Amount to borrow in quote token smallest units"),
    mode: z
      .enum(["withdraw", "compound"])
      .describe(
        '"withdraw" = receive tokens, "compound" = swap into more base token',
      ),
    slippageBps: z
      .number()
      .optional()
      .default(50)
      .describe("Slippage (compound mode only)"),
  }),
  handler: async (agent, input) => {
    try {
      const sig = await lavarageIncreaseBorrow(
        agent,
        input.positionAddress,
        input.additionalBorrowAmount,
        input.mode,
        input.slippageBps,
      );
      return { status: "success", signature: sig };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};
