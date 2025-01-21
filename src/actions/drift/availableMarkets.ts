import { MainnetSpotMarkets } from "@drift-labs/sdk";
import type { Action } from "../../types";
import { z } from "zod";
import {
  getAvailableDriftPerpMarkets,
  getAvailableDriftSpotMarkets,
} from "../../tools";

const availableDriftMarketsAction: Action = {
  name: "AVAILABLE_DRIFT_MARKETS",
  description: "Get a list of available drift markets",
  similes: [
    "get drift markets",
    "drift markets",
    "available drift markets",
    "get available drift perp markets",
    "get available spot markets on drift",
  ],
  examples: [
    [
      {
        input: {
          marketType: "spot",
        },
        output: {
          status: "success",
          message: `The list of available spot markets are ${MainnetSpotMarkets.map((v) => v.symbol).join(", ")}`,
          data: MainnetSpotMarkets,
        },
        explanation: "Get the list of available spot markets/tokens on drift",
      },
    ],
  ],
  schema: z.object({
    marketType: z
      .enum(["spot", "perp"])
      .describe("Type of market to get")
      .optional(),
  }),
  handler: async (agent, input) => {
    switch (input.marketType) {
      case "perp":
        return getAvailableDriftPerpMarkets();
      case "spot":
        return getAvailableDriftSpotMarkets();
      default:
        return {
          spot: getAvailableDriftSpotMarkets(),
          perp: getAvailableDriftPerpMarkets(),
        };
    }
  },
};

export default availableDriftMarketsAction;
