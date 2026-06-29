import { z } from "zod";
import { alchemyGetTokenPricesBySymbol } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyGetTokenPricesBySymbolAction: Action = {
  name: "ALCHEMY_GET_TOKEN_PRICES_BY_SYMBOL",
  similes: [
    "alchemy token price",
    "alchemy prices by symbol",
    "get token prices by symbol",
    "price from alchemy",
  ],
  description:
    "Fetches current token prices by symbol from Alchemy Prices API using API-key auth",
  examples: [
    [
      {
        input: {
          symbols: ["SOL", "USDC"],
        },
        output: {
          status: "success",
          prices: {
            data: [],
          },
          message: "Alchemy token prices fetched.",
        },
        explanation:
          "Fetches current prices for SOL and USDC using Alchemy's Prices API.",
      },
    ],
  ],
  schema: z.object({
    symbols: z
      .array(z.string().min(1))
      .min(1)
      .describe("Token symbols to price, such as SOL or USDC"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const prices = await alchemyGetTokenPricesBySymbol(agent, input.symbols);

      return {
        status: "success",
        prices,
        message: "Alchemy token prices fetched.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch Alchemy token prices: ${error.message}`,
      };
    }
  },
};

export default alchemyGetTokenPricesBySymbolAction;
