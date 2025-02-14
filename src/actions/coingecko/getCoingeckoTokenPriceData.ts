import { z } from "zod";
import { Action } from "../../types";

const getCoingeckoTokenPriceDataAction: Action = {
  name: "GET_COINGECKO_TOKEN_PRICE_DATA_ACTION",
  description: "Get the price data of a token on Coingecko",
  similes: [
    "Get the price data of a token on Coingecko",
    "get me the price data of a token on coingecko",
    "what's the price of this token on coingecko",
  ],
  examples: [
    [
      {
        input: {
          tokenAddresses: ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
        },
        explanation:
          "Get the price data of the token with the address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        output: {
          status: "success",
          result: {
            EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
              usd: 0.999899,
            },
          },
        },
      },
    ],
  ],
  schema: z.object({
    tokenAddresses: z.array(z.string().nonempty()),
  }),
  handler: async (agent, input) => {
    try {
      return {
        status: "success",
        result: await agent.getTokenPriceDataUsingCoingecko(
          ...input.tokenAddresses,
        ),
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - e is an object
        message: e.message,
      };
    }
  },
};

export default getCoingeckoTokenPriceDataAction;
