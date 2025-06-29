import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_recent_tokens } from "../tools/fetch_recent_tokens";

const fetchRecentTokensAction: Action = {
  name: "HOMOMEMETUS_FETCH_RECENT_TOKEN",
  description: "Recent token list from token list created in 24h",
  similes: ["fetch recent token list", "get recent token list"],
  examples: [
    [
      {
        input: {
          limit: 1,
        },
        output: {
          success: true,
          data: [
            {
              signature:
                "5paygwiAWtqfMj1yXkD72hwGJZdLzByiHVjpKuzdaADekwzLcuUsv4jnoBFUWMnCdt5UEdQiTbMxc3zF7XYnG7KS",
              mint_pubkey: "EKaGhwX1kNKFsD8kCjkcibRBUNajVqip4pcn9oiRWr4K",
              initial_buy_account_pubkey:
                "zeYQS5yB91CGVdUFdFWfb9FRVTCjrQ6gPSvyxKaKDLQ",
              initial_buy_token_account_pubkey:
                "3P664mSMMRtpbAVjDeaxXqpdJqjEeAcCR5Sn592CF94g",
              creator_pubkey: "zeYQS5yB91CGVdUFdFWfb9FRVTCjrQ6gPSvyxKaKDLQ",
              creator_token_account_pubkey:
                "3P664mSMMRtpbAVjDeaxXqpdJqjEeAcCR5Sn592CF94g",
              initial_buy_amount: 153285714.285714,
              initial_buy_sol_amount: 5,
              bondingcurve_pubkey:
                "AchEvPQHG5bRgFFSuNVNUAMov6NS5ukowBVSD3tBymwF",
              market_cap: 38.05529667598631,
              name: "Barcode Congress",
              symbol: "BC",
              uri: "https://ipfs.io/ipfs/QmSLm7qZyf6xb4uhKKcrvxrsf69RAvF2mezTux1f7K61n1",
              timestamp: "2025-06-24T00:00:02.144+00:00",
            },
          ],
        },
        explanation: "Recent token list successfully fetched",
      },
    ],
  ],
  schema: z.object({
    limit: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { limit } = input;

      const result = await fetch_recent_tokens(limit);
      return {
        status: "success",
        data: result,
        message: "Recent token list successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch recent token list ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_RECENT_TOKEN_FALIED",
      };
    }
  },
};

export default fetchRecentTokensAction;
