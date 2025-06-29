import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_tokens_by_duration } from "../tools/fetch_tokens_by_duration";

const fetchTokensByDurationAction: Action = {
  name: "HOMOMEMETUS_FETCH_TOKENS_BY_DURATION",
  description: "Creation-time-based token filter",
  similes: ["Fetch tokens by creation time", "Get tokens by creation time"],
  examples: [
    [
      {
        input: {
          start: "2025-06-24T10:00:39.460+00:00",
          end: "2025-06-24T11:00:08.222+00:00",
          sort: "asc",
          limit: 1,
        },
        output: {
          success: true,
          data: [
            {
              signature:
                "2sK1XS1GGCqgEpQzCYtrxTooyzCQ9XSjxcT4pLoxdHjfRshhggpwx2n95SyBVd8mw7co3vEsNi8Grgr8Gaf8BTNQ",
              mint_pubkey: "22NVDbZWJ9tkf2T7vJfnvPnifrDywa3seV5AjQ5quxsb",
              initial_buy_account_pubkey:
                "3LRWgNgogWyCBsCguTfWGUCWsu42d8ySiccCibjxRHz2",
              initial_buy_token_account_pubkey:
                "F2ZqfahhxG5fZPFUoLTEHDLsn6VHDXVX9kQJS8z7EKqp",
              creator_pubkey: "3LRWgNgogWyCBsCguTfWGUCWsu42d8ySiccCibjxRHz2",
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
          ],
        },
        explanation:
          "Filtered token list by creation time successfully fetched",
      },
    ],
  ],
  schema: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    sort: z.union([z.literal("asc"), z.literal("desc")]).optional(),
    limit: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { start, end, sort, limit } = input;

      const result = await fetch_tokens_by_duration(start, end, sort, limit);

      return {
        status: "success",
        data: result,
        message: "Token list filtered by creation time successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token list filtered by creation time ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_TOKENS_BY_DURATION_FALIED",
      };
    }
  },
};

export default fetchTokensByDurationAction;
