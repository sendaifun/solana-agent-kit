import { z } from "zod";
import { alchemyGetHistoricalTokenPrices } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyGetHistoricalTokenPricesAction: Action = {
  name: "ALCHEMY_GET_HISTORICAL_TOKEN_PRICES",
  similes: [
    "alchemy historical prices",
    "get historical token prices",
    "token price history from alchemy",
  ],
  description:
    "Fetches historical token price data from Alchemy Prices API using a caller-provided request body",
  examples: [
    [
      {
        input: {
          requestBody: {
            symbol: "SOL",
            startTime: "2026-01-01T00:00:00Z",
            endTime: "2026-01-02T00:00:00Z",
          },
        },
        output: {
          status: "success",
          prices: {
            data: [],
          },
          message: "Alchemy historical token prices fetched.",
        },
        explanation:
          "Fetches historical token prices through Alchemy's Prices API.",
      },
    ],
  ],
  schema: z.object({
    requestBody: z
      .record(z.any())
      .describe("Alchemy historical prices request body"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const prices = await alchemyGetHistoricalTokenPrices(
        agent,
        input.requestBody,
      );

      return {
        status: "success",
        prices,
        message: "Alchemy historical token prices fetched.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch Alchemy historical token prices: ${error.message}`,
      };
    }
  },
};

export default alchemyGetHistoricalTokenPricesAction;
