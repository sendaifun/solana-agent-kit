import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_tokens_by_metadata } from "../tools/fetch_tokens_by_metadata";

const fetchTokensByMetadataAction: Action = {
  name: "HOMOMEMETUS_FETCH_TOKENS_BY_METADATA",
  description: "Metadata-based token filter",
  similes: ["Fetch tokens by metadata", "Get tokens by metadata"],
  examples: [
    [
      {
        input: {
          name: "Coin Not Found",
          symbol: "$404",
          sort: "asc",
          limit: 5,
        },
        output: {
          success: true,
          data: [
            [
              {
                signature:
                  "3NdEx1C8AiChoF3uTJnXTeaotDjmQfHGhGVx3vXU47GMJHyMrZ144U9HjZ18KssNrJtbQ8zv98CUpxvC38wR4rap",
                mint_pubkey: "9zf1sAyBrJMag2uBg1XxRTWBLK8xhZcVrjWocUhRpump",
                initial_buy_account_pubkey:
                  "314BmmZuTEV5t13YiA4Qndjbh7WJpHY1JeeAt8gcmWAj",
                initial_buy_token_account_pubkey:
                  "2Rep17R3sKmVDzvMNYkZVQo2PbRorqTvJ2Qotu3UJDyq",
                creator_pubkey: "314BmmZuTEV5t13YiA4Qndjbh7WJpHY1JeeAt8gcmWAj",
                creator_token_account_pubkey:
                  "2Rep17R3sKmVDzvMNYkZVQo2PbRorqTvJ2Qotu3UJDyq",
                initial_buy_amount: 1413219.49808,
                initial_buy_sol_amount: 0.039564304,
                bondingcurve_pubkey:
                  "579yCB6PXEyCBWZJqUSQ9io96BXixaEhe2pzbVmYTKdz",
                market_cap: 28.03278731167217,
                name: "Coin Not Found",
                symbol: "$404",
                uri: "https://ipfs.io/ipfs/QmehmtdULLQBGPFqeUWtAtX6LgMdhBzX9U3Gosz3gFPUjC",
                timestamp: "2025-06-24T11:04:00.972Z",
              },
            ],
          ],
        },
        explanation: "Filtered token list by metadata successfully fetched",
      },
    ],
  ],
  schema: z.object({
    name: z.string().optional(),
    symbol: z.string().optional(),
    sort: z.union([z.literal("asc"), z.literal("desc")]).optional(),
    limit: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { name, symbol, sort, limit } = input;

      const result = await fetch_tokens_by_metadata(name, symbol, sort, limit);

      return {
        status: "success",
        data: result,
        message: "Token list filtered by metadata successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token list filtered by metadata ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_TOKENS_BY_METADATA_FALIED",
      };
    }
  },
};

export default fetchTokensByMetadataAction;
