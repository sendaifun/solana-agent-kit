import { z } from "zod";
import type { Action } from "../../types";
import { calculatePerpMarketFundingRate } from "../../tools";

const perpMarktetFundingRateAction: Action = {
  name: "DRIFT_PERP_MARKET_FUNDING_RATE_ACTION",
  description: "Get the funding rate of a perpetual market on Drift",
  similes: [
    "get the yearly funding rate of a perpetual market on drift",
    "get the funding rate of a perp market on drift",
    "get the hourly funding rate of a perpetual market on drift",
    "get the funding rate of the BTC-PERP market on drift",
    "get the funding rate of the SOL-PERP market on drift",
  ],
  examples: [
    [
      {
        input: {
          marketSymbol: "BTC-PERP",
        },
        output: {
          status: "success",
          data: {
            longRate: 0.0001,
            shortRate: 0.0002,
          },
        },
        explanation: "Get the funding rate of the BTC-PERP market",
      },
    ],
  ],
  schema: z.object({
    marketSymbol: z
      .string()
      .toUpperCase()
      .describe("Symbol of the perpetual market"),
    period: z.enum(["year", "hour"]).default("hour").optional(),
  }),
  handler: async (agent, input) => {
    try {
      const data = await calculatePerpMarketFundingRate(
        agent,
        input.marketSymbol,
        input.period,
      );

      return {
        status: "success",
        data,
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

export default perpMarktetFundingRateAction;
