import { z } from "zod";
import { Action } from "../../types";

const getCoingeckoTopGainersAction: Action = {
  name: "GET_COINGECKO_TOP_GAINERS",
  description: "Get the top gainers on Coingecko",
  similes: [
    "Get the top gainers on Coingecko",
    "get me a list of the top gainers on coingecko",
    "what are the top gainers on coingecko",
  ],
  examples: [
    [
      {
        input: {
          duration: "24h",
          topCoins: 300,
        },
        output: {
          status: "success",
          result: [
            {
              top_gainers: [
                {
                  id: "bonk",
                  symbol: "bonk",
                  name: "Bonk",
                  image:
                    "https://assets.coingecko.com/coins/images/28600/original/bonk.jpg?1696527587",
                  market_cap_rank: 75,
                  usd: 0.000024645873833743,
                  usd_24h_vol: 105344205.633894,
                  usd_1y_change: 4244.15510979623,
                },
                {
                  id: "0x0-ai-ai-smart-contract",
                  symbol: "0x0",
                  name: "0x0.ai: AI Smart Contract",
                  image:
                    "https://assets.coingecko.com/coins/images/28880/original/0x0.png?1696527857",
                  market_cap_rank: 235,
                  usd: 0.388236182838391,
                  usd_24h_vol: 1608196.56989005,
                  usd_1y_change: 3688.24996780839,
                },
              ],
            },
          ],
        },
        explanation: "Get the top gainers on Coingecko for the last 24 hours",
      },
    ],
  ],
  schema: z.object({
    duration: z.enum(["1h", "24h", "7d", "14d", "30d", "60d", "1y"]).optional(),
  }),
  handler: async (agent, input) => {
    try {
      return {
        status: "success",
        result: await agent.getTopGainersOnCoingecko(input.duration),
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is an object
        message: e.message,
      };
    }
  },
};

export default getCoingeckoTopGainersAction;
