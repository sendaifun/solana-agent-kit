import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { fetchPythPrice, fetchPythPriceFeedID } from "../tools";

const pythFetchPriceAction: Action = {
  name: "PYTH_FETCH_PRICE",
  similes: [
    "get pyth price",
    "check pyth price",
    "pyth oracle price",
    "fetch from pyth",
    "pyth price feed",
    "oracle price",
  ],
  description: "Fetch the current price from a Pyth oracle price feed",
  examples: [
    [
      {
        input: {
          tokenSymbol: "SOL", // SOL/USD price feed
        },
        output: {
          status: "success",
          price: "23.45",
          message: "Current price: $23.45",
        },
        explanation: "Get the current SOL/USD price from Pyth oracle",
      },
    ],
  ],
  schema: z.object({
    tokenSymbol: z
      .string()
      .min(1)
      .describe("The token symbol to fetch the price for"),
  }),
  handler: async (_agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const priceFeedId = await fetchPythPriceFeedID(
        input.tokenSymbol as string,
      );

      const priceStr = await fetchPythPrice(priceFeedId);

      return {
        status: "success",
        price: priceStr,
        message: `Current price: $${priceStr}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch price from Pyth: ${error.message}`,
      };
    }
  },
};

export default pythFetchPriceAction;
