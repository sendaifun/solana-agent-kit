import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_tokens_by_creators } from "../tools/fetch_tokens_by_creators";

const fetchTokensByCreatorsAction: Action = {
  name: "HOMOMEMETUS_FETCH_TOKENS_BY_CREATORS",
  description: "Creator-address-list-based token filter",
  similes: ["Fetch tokens by creators", "Get tokens by creators"],
  examples: [
    [
      {
        input: {
          addresses: [
            "6mCnLNAbErPVQPghoCH5XPCkSJAfJgjM8k7NsUSbGrH6",
            "E2M8jXzQtJ76AQqujFyZPUkgVQyfKbZebtmptkPGLZYz",
          ],
          sort: "asc",
        },
        output: {
          success: true,
          data: [
            {
              signature:
                "5KqEUwEFvY1C3CZgaMeR64sqjygQ2JDwPrpuhaoNFCWHvirjfkqkgNXnu7T8U3ejAvV5YS3CmPcQPPHWVTp3X2Kf",
              mint_pubkey: "2DRBVKDvUDdDKzKyaevsKDmLKuzbFMSrY1ysnN6Apump",
              initial_buy_account_pubkey:
                "6mCnLNAbErPVQPghoCH5XPCkSJAfJgjM8k7NsUSbGrH6",
              initial_buy_token_account_pubkey:
                "3MQivFmqRoWWxdxt8oEXeEWf64TndyqJVj3XFmeG7QJH",
              creator_pubkey: "6mCnLNAbErPVQPghoCH5XPCkSJAfJgjM8k7NsUSbGrH6",
              creator_token_account_pubkey:
                "3MQivFmqRoWWxdxt8oEXeEWf64TndyqJVj3XFmeG7QJH",
              initial_buy_amount: 11560235.054306,
              initial_buy_sol_amount: 0.326732673,
              bondingcurve_pubkey:
                "4HJYQykXPbkh43oZGoRtNNb39KMX7y4VUihV8qmbXMQy",
              market_cap: 28.571317633414253,
              name: "BabyGhost",
              symbol: "BabyGhost",
              uri: "https://ipfs.io/ipfs/bafkreicqo4dfuje6s4zjkvhs2wokgqj3ei4rj32ztr26q3mkri5tywiuya",
              timestamp: "2025-06-24T10:00:39.460+00:00",
            },
            {
              signature:
                "XthejVxy7goLWR7sLDn9H6DZzU1EaH6ACjySi7T9SnRo6iiGwbJGyWYCQmBTp6W355rQ635GqGoYRN4EA2XmXSD",
              mint_pubkey: "HsqtqhNZvtGx6tbTtddqDdvrViHUr7Lsi7D9ncmCpump",
              initial_buy_account_pubkey:
                "6mCnLNAbErPVQPghoCH5XPCkSJAfJgjM8k7NsUSbGrH6",
              initial_buy_token_account_pubkey:
                "48zja4AgsJEKP5FVBB8jrgpEocKbP28D5ZFo6rcMMHZw",
              creator_pubkey: "6mCnLNAbErPVQPghoCH5XPCkSJAfJgjM8k7NsUSbGrH6",
              creator_token_account_pubkey:
                "48zja4AgsJEKP5FVBB8jrgpEocKbP28D5ZFo6rcMMHZw",
              initial_buy_amount: 11560235.054306,
              initial_buy_sol_amount: 0.326732673,
              bondingcurve_pubkey:
                "28bQtHwe8pUYWpkZ2RBJnyZvJP94fkMiFWtWUEqcqHZo",
              market_cap: 28.571317633414253,
              name: "Fart Walking",
              symbol: "FW",
              uri: "https://ipfs.io/ipfs/bafkreifrntvgsxj4zkik6ygznjpvcts42nkpai7zs5ihmce32stck7pkly",
              timestamp: "2025-06-24T18:01:08.222+00:00",
            },
            {
              signature:
                "4PJJ69WKMTDQqm165Y4xqHrVLvXic2cfyRv1fXSA4mrDrkDBLZEd9Ee6SaJgaLBwh2WHzpwE1ko2sFtkZoXUjhqF",
              mint_pubkey: "EVUxpG8dZvQ8zsWsm5aDSkGbDAy3TyuhKaUZJjaepump",
              initial_buy_account_pubkey:
                "E2M8jXzQtJ76AQqujFyZPUkgVQyfKbZebtmptkPGLZYz",
              initial_buy_token_account_pubkey:
                "ycnctFb6G9mLACWEd1phAaBZ7LJeXYKWecK5QkemzeM",
              creator_pubkey: "E2M8jXzQtJ76AQqujFyZPUkgVQyfKbZebtmptkPGLZYz",
              creator_token_account_pubkey:
                "ycnctFb6G9mLACWEd1phAaBZ7LJeXYKWecK5QkemzeM",
              initial_buy_amount: 707783.634087,
              initial_buy_sol_amount: 0.01980198,
              bondingcurve_pubkey:
                "DDKdE15qcwdr6kXkWi9tTjH1Zf6MsFCdAdLG87yf8cmo",
              market_cap: 27.99591521958405,
              name: "1",
              symbol: "ticker",
              uri: "https://ipfs.io/ipfs/bafkreihxvs2ccmm6uf56ojmjjis2voqxedhvmxyqtnggm4x2kyh7ceyjsi",
              timestamp: "2025-06-24T10:00:38.933+00:00",
            },
          ],
        },
        explanation:
          "Filtered token list by creator addresses successfully fetched",
      },
    ],
  ],
  schema: z.object({
    addresses: z.string().array(),
    sort: z.union([z.literal("asc"), z.literal("desc")]).optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { addresses, sort } = input;

      const result = await fetch_tokens_by_creators(addresses, sort);

      return {
        status: "success",
        data: result,
        message: "Token list by creator address list successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token list by creator addresses list ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_TOKENS_BY_CREATORS_FALIED",
      };
    }
  },
};

export default fetchTokensByCreatorsAction;
