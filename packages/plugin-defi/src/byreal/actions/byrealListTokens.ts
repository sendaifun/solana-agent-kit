import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealListTokens } from "../tools";

export const byrealListTokensAction: Action = {
  name: "BYREAL_LIST_TOKENS",
  similes: [
    "list byreal tokens",
    "search byreal tokens",
    "get byreal token list",
  ],
  description: "List tokens available on Byreal DEX with optional search",
  examples: [
    [
      {
        input: { searchKey: "SOL" },
        output: {
          status: "success",
          data: {
            items: [{ mint: "So11...", symbol: "SOL", price_usd: 150.5 }],
            total: 1,
          },
        },
        explanation: "Search for SOL token on Byreal",
      },
    ],
  ],
  schema: z.object({
    searchKey: z.string().optional().describe("Search by symbol or name"),
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Results per page"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealListTokens(agent, {
        searchKey: input.searchKey,
        page: input.page,
        pageSize: input.pageSize,
      });
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to list Byreal tokens: ${error.message}`,
      };
    }
  },
};
