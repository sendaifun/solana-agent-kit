import { z } from "zod";
import type { Action } from "../../types";
import { swapSpotToken } from "../../tools";

const driftSpotTokenSwapAction: Action = {
  name: "DRIFT_SPOT_TOKEN_SWAP_ACTION",
  description: "Swap a token for another token on Drift",
  similes: [
    "swap a token for another token on drift",
    "exchange a token for another token on drift",
    "trade a token for another token on drift",
    "swap usdc to 5 sol on drift (in this case 5 sol is the toAmount)",
    "swap 5 usdt to DRIFT on drift (in this case 5 usdt is the fromAmount)",
  ],
  examples: [
    [
      {
        input: {
          fromSymbol: "SOL",
          toSymbol: "USDC",
          fromAmount: 100,
        },
        output: {
          status: "success",
          message: "Swapped 100 SOL for USDC on Drift",
          signature: "4FdasklhiIHyOI",
        },
        explanation: "Swap 100 SOL for USDC on Drift",
      },
    ],
  ],
  schema: z.object({
    fromSymbol: z.string().describe("Symbol of the token to swap from"),
    toSymbol: z.string().describe("Symbol of the token to swap to"),
    fromAmount: z
      .number()
      .positive()
      .describe("Amount to swap from e.g 50 === 50 SOL")
      .optional(),
    toAmount: z
      .number()
      .positive()
      .describe("Amount to swap to e.g 5000 === 5000 USDC")
      .optional(),
    slippage: z
      .number()
      .positive()
      .describe("Slippage tolerance in percentage e.g 0.5 === 0.5%")
      .default(0.5),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await swapSpotToken(agent, {
        fromSymbol: input.fromSymbol,
        toSymbol: input.toSymbol,
        fromAmount: input.fromAmount,
        toAmount: input.toAmount,
        slippage: input.slippage,
      });

      return {
        status: "success",
        message: `Swapped ${input.fromAmount} ${input.fromSymbol} for ${input.toAmount} ${input.toSymbol} on Drift`,
        data: {
          signature: tx,
        },
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error error is not a string
        message: e.message,
      };
    }
  },
};

export default driftSpotTokenSwapAction;
