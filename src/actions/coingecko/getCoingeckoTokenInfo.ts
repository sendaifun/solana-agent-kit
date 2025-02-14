import { z } from "zod";
import { Action } from "../../types";

const getCoingeckoTokenInfoAction: Action = {
  name: "GET_COINGECKO_TOKEN_INFO_ACTION",
  description: "Get token information from Coingecko",
  similes: [
    "get token information from coingecko",
    "get coingecko token information",
    "get token info",
  ],
  examples: [
    [
      {
        input: {
          tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          data: {
            id: "solana_EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            type: "token",
            attributes: {
              address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              name: "USD Coin",
              symbol: "USDC",
              decimals: 6,
              image_url:
                "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
              coingecko_coin_id: "usd-coin",
              websites: ["https://www.circle.com/en/usdc"],
              discord_url: "https://discord.com/invite/buildoncircle",
              telegram_handle: null,
              twitter_handle: "circle",
              description:
                "USDC is a fully collateralized US dollar stablecoin. USDC is the bridge between dollars and trading on cryptocurrency exchanges. The technology behind CENTRE makes it possible to exchange value between people, businesses and financial institutions just like email between mail services and texts between SMS providers. We believe by removing artificial economic borders, we can create a more inclusive global economy.",
              gt_score: 54.12844036697248,
              categories: [],
              gt_category_ids: [],
            },
          },
        },
        explanation: "Get USDC token info from Coingecko",
      },
    ],
  ],
  schema: z.object({
    tokenAddress: z.string().nonempty(),
  }),
  handler: async (agent, input) => {
    try {
      const tokenInfo = await agent.getTokenInfoUsingCoingecko(
        input.tokenAddress,
      );
      return {
        status: "success",
        result: tokenInfo,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is not a property of unknown
        message: e.message,
      };
    }
  },
};

export default getCoingeckoTokenInfoAction;
