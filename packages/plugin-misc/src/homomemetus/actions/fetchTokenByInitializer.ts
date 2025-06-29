import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_token_by_initializer } from "../tools/fetch_token_by_initializer";

const fetchTokenByInitializerAction: Action = {
  name: "HOMOMEMETUS_FETCH_TOKEN_BY_INITIALIZER",
  description: "Initializer-address-based token filter",
  similes: ["Fetch token by initializer", "Get token by initializer"],
  examples: [
    [
      {
        input: {
          address: "3T7AV13761fS8FKCDg1B1JpekuZnn2WhF5Ks4CrfpcFj",
        },
        output: {
          success: true,
          data: [
            {
              signature:
                "2GVLfK8Y5Njr1xUk7Qjxg47YotV371DehkrimHNMVtgr4C7CuxKgxTNhbhLcNFagBxdM3Lk6h9RX9ivL4wnAcWX3",
              mint_pubkey: "5KwjZsrpQPNaBHSy76f2Tts7QaJqKJ5unN7r1Fo8pump",
              initial_buy_account_pubkey:
                "ELoV5uxHiBE8BDkxF4H8VoxqbmHmpHqPyu3tprhVh8do",
              initial_buy_token_account_pubkey:
                "GnDBuvpQG5CzTirNXz3qBvFs58eXjj9biRzUkqF9qSW9",
              creator_pubkey: "3T7AV13761fS8FKCDg1B1JpekuZnn2WhF5Ks4CrfpcFj",
              creator_token_account_pubkey:
                "ELoV5uxHiBE8BDkxF4H8VoxqbmHmpHqPyu3tprhVh8do",
              initial_buy_amount: 97545454.545454,
              initial_buy_sol_amount: 3,
              bondingcurve_pubkey:
                "DjNJdKV4nYrxk3193Qz5ZCrKHYTVVwjkdV5mR2NdHdqF",
              market_cap: 33.830382106244144,
              name: "Sang Biao",
              symbol: "Sang Biao",
              uri: "https://ipfs.io/ipfs/bafkreibopkpapu4k3iwkpj4farmhix3lf6dt7ivrkfgpstdkdo4fiwgzsy",
              timestamp: "2025-06-24T07:00:14.319+00:00",
            },
          ],
        },
        explanation:
          "Filtered token list by initializer addcress successfully fetched",
      },
    ],
  ],
  schema: z.object({
    address: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { address } = input;

      const result = await fetch_token_by_initializer(address);
      return {
        status: "success",
        data: result,
        message: "Token list by initializer address successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token list by initializer address ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_TOKEN_BY_INITIALIZER_FALIED",
      };
    }
  },
};

export default fetchTokenByInitializerAction;
