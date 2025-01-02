import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { pythFetchPrice } from "../tools";

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
          priceFeedId: "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD", // SOL/USD price feed
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
    priceFeedId: z
      .string()
      .min(1)
      .describe("The Pyth price feed ID to fetch the price from"),
  }),
  handler: async (_agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const priceFeedId = input.tokenId as string;
      const priceStr = await pythFetchPrice(priceFeedId);
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
