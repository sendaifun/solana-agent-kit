import { z } from "zod";
import type { Action } from "../../types";
import { driftPerpTrade } from "../../tools";

export const tradeDriftPerpAccountAction: Action = {
  name: "TRADE_DRIFT_PERP_ACCOUNT",
  similes: [
    "trade drift perp account",
    "trade drift perp",
    "trade drift perpetual account",
    "trade perp account",
    "trade account",
  ],
  description: "Trade a perpetual account on Drift protocol",
  examples: [
    [
      {
        input: {
          amount: 100,
          symbol: "SOL",
          action: "long",
          type: "market",
        },
        output: {
          status: "success",
          message: "Trade successful",
        },
        explanation: "Open a $100 long position on SOL.",
      },
    ],
    [
      {
        input: {
          amount: 50,
          symbol: "BTC",
          action: "short",
          type: "limit",
          price: 50000,
        },
        output: {
          status: "success",
          message: "Trade successful",
        },
        explanation: "$50 short position on BTC at $50,000.",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z
      .string()
      .toUpperCase()
      .describe("Symbol of the token to open a position on "),
    action: z.enum(["long", "short"]),
    type: z.enum(["market", "limit"]),
    price: z.number().positive().optional(),
  }),
  handler: async (agent, input) => {
    try {
      const signature = await driftPerpTrade(agent, {
        action: input.action,
        amount: input.amount,
        symbol: input.symbol,
        type: input.type,
        price: input.price,
      });

      return {
        status: "success",
        signature: signature,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message is a string
        message: `Failed to trade perp account: ${e.message}`,
      };
    }
  },
};

export default tradeDriftPerpAccountAction;
