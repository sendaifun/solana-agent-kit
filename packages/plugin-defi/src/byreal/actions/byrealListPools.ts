import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealListPools } from "../tools";

export const byrealListPoolsAction: Action = {
  name: "BYREAL_LIST_POOLS",
  similes: [
    "list byreal pools",
    "get byreal liquidity pools",
    "show byreal CLMM pools",
    "byreal pool list",
  ],
  description:
    "List liquidity pools on Byreal DEX with optional sorting and pagination",
  examples: [
    [
      {
        input: { sortField: "tvl", sortType: "desc", page: 1, pageSize: 10 },
        output: {
          status: "success",
          data: {
            items: [{ id: "PoolAddr...", pair: "SOL/USDC", tvl_usd: 1500000 }],
            total: 100,
          },
        },
        explanation: "List Byreal pools sorted by TVL descending",
      },
    ],
  ],
  schema: z.object({
    sortField: z
      .string()
      .optional()
      .describe("Sort field: tvl, volumeUsd24h, feeUsd24h, apr24h"),
    sortType: z.string().optional().describe("Sort order: asc or desc"),
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Results per page"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealListPools(agent, {
        sortField: input.sortField,
        sortType: input.sortType,
        page: input.page,
        pageSize: input.pageSize,
      });
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to list Byreal pools: ${error.message}`,
      };
    }
  },
};
