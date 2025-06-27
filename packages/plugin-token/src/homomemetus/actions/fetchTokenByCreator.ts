import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_token_by_creator } from "../tools/fetch_token_by_creator";

const fetchTokenByCreatorAction: Action = {
  name: "HOMOMEMETUS_FETCH_TOKEN_BY_CREATOR",
  description: "Creator-address-based token filter",
  similes: ["Fetch token by creator", "Get token by creator"],
  examples: [
    [
      {
        input: {
          address: "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
        },
        output: {
          success: true,
          data: [
            {
              signature:
                "2S9JJSHh8eJFHynqrrZRfNVuBmBLveMDn8YVSKuqCV6T1UkUAZr8QxEK5VNTqw3RtR4HR8GJUtWJRdWvWmFtBfMc",
              mint_pubkey: "Gsb9k4GN49L4qU5io7TjjwLbtdfKqx8gtN7bA2jDiRMC",
              initial_buy_account_pubkey:
                "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
              initial_buy_token_account_pubkey:
                "GnDBuvpQG5CzTirNXz3qBvFs58eXjj9biRzUkqF9qSW9",
              creator_pubkey: "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
              creator_token_account_pubkey:
                "GnDBuvpQG5CzTirNXz3qBvFs58eXjj9biRzUkqF9qSW9",
              initial_buy_amount: 357.666547,
              initial_buy_sol_amount: 0.00001,
              bondingcurve_pubkey:
                "4cBo9mKXKEiHZ7Lp6bqP9sayqZhSKa6838EYqT6NYSLR",
              market_cap: 27.959012115566917,
              name: "asd",
              symbol: "asd",
              uri: "https://ipfs.io/ipfs/QmcL8HsaSjmaojgJfQjzWsonhR2oSPGuDQkNKMgXdH3y1h",
              timestamp: "2025-06-24T07:00:11.350+00:00",
            },
            {
              signature:
                "5iXDxHzV3147iAXFDpMUHgxUHvoCZ9orAjGEUUkirHbUJsbaN22v2pcvbnukptJwHsr6Tc65F7Uu9oW1m8JJ3SDC",
              mint_pubkey: "4E9M7kxzc2cRSrjEnHDirqRoCcxWtEMcLbYSwQqGtKEB",
              initial_buy_account_pubkey:
                "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
              initial_buy_token_account_pubkey:
                "894LGMpB9R2ZzPdTrUEV9iMsHCUmxUby8SdZbUyPBS3V",
              creator_pubkey: "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
              creator_token_account_pubkey:
                "894LGMpB9R2ZzPdTrUEV9iMsHCUmxUby8SdZbUyPBS3V",
              initial_buy_amount: 357.666547,
              initial_buy_sol_amount: 0.00001,
              bondingcurve_pubkey:
                "BYUUYDyfXeX3xaCenwtPKcLnzA17DKoVrXL9Nz1DLRoX",
              market_cap: 27.959012115566917,
              name: "asd",
              symbol: "asd",
              uri: "https://ipfs.io/ipfs/QmZL123jN18LaAAyM3LzzxkBmFhMMkV4yJp3rHGoir8qTe",
              timestamp: "2025-06-24T07:00:20.227+00:00",
            },
            {
              signature:
                "4ZBdzW2MhT4j34uPEMXZT5dnyKMgQ8bFC6jo8KFHojePP7icH3pRsgGe9x17h7hnQfQKuj4QUbYzUMA9ZAm6KHJH",
              mint_pubkey: "Aw5ogUGCQPoosQ7AeMHBHbQt7wM6yCaMHrCqQxSL85io",
              initial_buy_account_pubkey:
                "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
              initial_buy_token_account_pubkey:
                "GTQv5MbzHDXuWwzpShDH8aRc9uaGa2ZmjAZ2JpNvFPEG",
              creator_pubkey: "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
              creator_token_account_pubkey:
                "GTQv5MbzHDXuWwzpShDH8aRc9uaGa2ZmjAZ2JpNvFPEG",
              initial_buy_amount: 67062500,
              initial_buy_sol_amount: 2,
              bondingcurve_pubkey:
                "8vuCZtU5xZCx1ey3Xg56Kaj4RvBv7oE2W64YQrHbXsKs",
              market_cap: 31.811121466293883,
              name: "Smoking Pepe",
              symbol: "ElonPepe",
              uri: "https://ipfs.io/ipfs/QmRCpuuob6LQtFUx7RB5vkHfhnMppaGzhehTTDefK6UeBV",
              timestamp: "2025-06-24T07:26:32.355+00:00",
            },
            {
              signature:
                "arjTABrspRJu8SLoETrEhEvU5YNtT2CCBfHvzMeuFKqjBWfJU5mC3xjbQEi7FS4xv7AM5LfftKqz6vYg6RQJcQK",
              mint_pubkey: "3hWjQdsv5k1vX9AUzH6batbaYDWJAQ3UD47Ui8JPVmdM",
              initial_buy_account_pubkey:
                "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
              initial_buy_token_account_pubkey:
                "9qqWK3fsDrwPifHgyCwf3MsniTaYqx1Ram44eqAeD9Pu",
              creator_pubkey: "7kkdkb1VB2vsZ4jDT389jiYYSK92rtLjT7taDBSUmTq7",
              creator_token_account_pubkey:
                "9qqWK3fsDrwPifHgyCwf3MsniTaYqx1Ram44eqAeD9Pu",
              initial_buy_amount: 357.666547,
              initial_buy_sol_amount: 0.00001,
              bondingcurve_pubkey:
                "FbYFkX92HfspMiooB153KBtZZdAaEwcKrqiKBEW82LFM",
              market_cap: 27.959012115566917,
              name: "Pepe Elon",
              symbol: "Pepe Elon",
              uri: "https://ipfs.io/ipfs/QmaF1MPzBFq18JQ1nkzou1wZSw1ycNowffz59kGQTzuMW2",
              timestamp: "2025-06-24T08:30:50.928+00:00",
            },
          ],
        },
        explanation:
          "Filtered token list by creator addcress successfully fetched",
      },
    ],
  ],
  schema: z.object({
    address: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { address } = input;

      const result = await fetch_token_by_creator(address);
      return {
        status: "success",
        data: result,
        message: "Token list by creator address successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token list by creator address ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_TOKEN_BY_CREATOR_FALIED",
      };
    }
  },
};

export default fetchTokenByCreatorAction;
