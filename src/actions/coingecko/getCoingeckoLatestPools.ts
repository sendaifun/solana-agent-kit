import { z } from "zod";
import { Action } from "../../types";

const getCoingeckoLatestPoolsActions: Action = {
  name: "GET_COINGECKO_LATEST_POOLS",
  description: "Get the latest pools on Coingecko",
  similes: [
    "Get the latest pools on Coingecko",
    "get me a list of the latest pools on coingecko",
    "what are the latest pools on coingecko",
  ],
  examples: [
    [
      {
        input: {},
        output: {
          data: [
            {
              id: "eth_0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
              type: "pool",
              attributes: {
                base_token_price_usd: "3653.12491645176",
                base_token_price_native_currency: "1.0",
                quote_token_price_usd: "0.998343707926245",
                quote_token_price_native_currency: "0.000273040545093221",
                base_token_price_quote_token: "3662.46",
                quote_token_price_base_token: "0.00027304",
                address: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
                name: "WETH / USDC 0.05%",
                pool_created_at: "2021-12-29T12:35:14Z",
                fdv_usd: "11007041041",
                market_cap_usd: null,
                price_change_percentage: {
                  m5: "0",
                  h1: "0.51",
                  h6: "0.86",
                  h24: "7.71",
                },
                transactions: {
                  m5: {
                    buys: 7,
                    sells: 2,
                    buyers: 7,
                    sellers: 2,
                  },
                  m15: {
                    buys: 19,
                    sells: 27,
                    buyers: 19,
                    sellers: 27,
                  },
                  m30: {
                    buys: 49,
                    sells: 61,
                    buyers: 45,
                    sellers: 57,
                  },
                  h1: {
                    buys: 97,
                    sells: 144,
                    buyers: 83,
                    sellers: 124,
                  },
                  h24: {
                    buys: 2966,
                    sells: 3847,
                    buyers: 1625,
                    sellers: 2399,
                  },
                },
                volume_usd: {
                  m5: "868581.7348314",
                  h1: "16798158.0138526",
                  h6: "164054610.850188",
                  h24: "536545444.904535",
                },
                reserve_in_usd: "163988541.3812",
              },
              relationships: {
                base_token: {
                  data: {
                    id: "eth_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                    type: "token",
                  },
                },
                quote_token: {
                  data: {
                    id: "eth_0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    type: "token",
                  },
                },
                dex: {
                  data: {
                    id: "uniswap_v3",
                    type: "dex",
                  },
                },
              },
            },
          ],
          included: [
            {
              id: "eth_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              type: "token",
              attributes: {
                address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                name: "Wrapped Ether",
                symbol: "WETH",
                image_url:
                  "https://assets.coingecko.com/coins/images/2518/small/weth.png?1696503332",
                coingecko_coin_id: "weth",
              },
            },
          ],
        },
        explanation: "Get the latest pools on Coingecko",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent) => {
    try {
      return {
        status: "success",
        result: await agent.getCoingeckoLatestPools(),
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

export default getCoingeckoLatestPoolsActions;
