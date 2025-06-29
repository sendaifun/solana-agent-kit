import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_tokens_by_mints } from "../tools/fetch_tokens_by_mints";

const fetchTokensByMintsAction: Action = {
  name: "HOMOMEMETUS_FETCH_TOKENS_BY_MINTS",
  description: "Mint-addresses-based token filter",
  similes: ["Fetch tokens by mint addresses", "Get tokens by mint addresses"],
  examples: [
    [
      {
        input: {
          addresses: [
            "22NVDbZWJ9tkf2T7vJfnvPnifrDywa3seV5AjQ5quxsb",
            "4MUgCGZPZtnhwPQPPcLCTX9CPDQUKAN4YzMHTEt3pump",
          ],
        },
        output: {
          success: true,
          data: [
            [
              [
                {
                  signature:
                    "2sK1XS1GGCqgEpQzCYtrxTooyzCQ9XSjxcT4pLoxdHjfRshhggpwx2n95SyBVd8mw7co3vEsNi8Grgr8Gaf8BTNQ",
                  mint_pubkey: "22NVDbZWJ9tkf2T7vJfnvPnifrDywa3seV5AjQ5quxsb",
                  initial_buy_account_pubkey:
                    "3LRWgNgogWyCBsCguTfWGUCWsu42d8ySiccCibjxRHz2",
                  initial_buy_token_account_pubkey:
                    "F2ZqfahhxG5fZPFUoLTEHDLsn6VHDXVX9kQJS8z7EKqp",
                  creator_pubkey:
                    "3LRWgNgogWyCBsCguTfWGUCWsu42d8ySiccCibjxRHz2",
                  creator_token_account_pubkey:
                    "F2ZqfahhxG5fZPFUoLTEHDLsn6VHDXVX9kQJS8z7EKqp",
                  initial_buy_amount: 63909090.90909,
                  initial_buy_sol_amount: 1.9,
                  bondingcurve_pubkey:
                    "GAfAEszet9ZMKnqVZP61rDgBToH4UrL48GFy9K3uBYWj",
                  market_cap: 31.61261261261256,
                  name: "coffeewifsmile",
                  symbol: "CWS",
                  uri: "https://ipfs.io/ipfs/QmNSmyxhz2q2dGjAowh5Y7Uv6522HkSwkJic7PehZxmtBZ",
                  timestamp: "2025-06-24T11:00:00.201Z",
                },
                {
                  signature:
                    "23PN9XmZAZLEXrBDitqFezprJTzavCaXv9TBro4ND3kFNoSdCDLZofWTqztWjSUAYEgmaBgHHcJHT6FKHzcfGKWW",
                  mint_pubkey: "4MUgCGZPZtnhwPQPPcLCTX9CPDQUKAN4YzMHTEt3pump",
                  initial_buy_account_pubkey:
                    "7bhbydXesvQMLvB4eNwMzh6vC9txnWP4RZMK1yfASXEf",
                  initial_buy_token_account_pubkey:
                    "6LpD7SJ9qh9Ut9bBYgtmhMJ4XjDMNt8GjUJzveKZTc2D",
                  creator_pubkey:
                    "7bhbydXesvQMLvB4eNwMzh6vC9txnWP4RZMK1yfASXEf",
                  creator_token_account_pubkey:
                    "6LpD7SJ9qh9Ut9bBYgtmhMJ4XjDMNt8GjUJzveKZTc2D",
                  initial_buy_amount: 17418831.135929,
                  initial_buy_sol_amount: 0.495049504,
                  bondingcurve_pubkey:
                    "Ek7H9AodD7TkABocn5Gp3mfzRgfT9Ru72Wz8tkt2UWTd",
                  market_cap: 28.889345891625005,
                  name: "Staisfaction",
                  symbol: "Satisfied",
                  uri: "https://ipfs.io/ipfs/bafkreia5egthjingeqckepo2rtmu2oarxhqloppqapebi2u6eqtbwbex7a",
                  timestamp: "2025-06-24T11:00:20.078Z",
                },
              ],
            ],
          ],
        },
        explanation:
          "Filtered token list by mint addresses successfully fetched",
      },
    ],
  ],
  schema: z.object({
    addresses: z.string().array(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { addresses } = input;

      const result = await fetch_tokens_by_mints(addresses);

      return {
        status: "success",
        data: result,
        message: "Token list filtered by mint addresses successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token list filtered by mint addresses ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_TOKENS_BY_MINTS_FALIED",
      };
    }
  },
};

export default fetchTokensByMintsAction;
