import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealGetTopPositions } from "../tools";

export const byrealGetTopPositionsAction: Action = {
  name: "BYREAL_GET_TOP_POSITIONS",
  similes: [
    "byreal top positions",
    "best byreal positions",
    "byreal copy farmer",
    "top performers on byreal",
  ],
  description:
    "Get top-performing CLMM positions for a Byreal pool (for copy farming)",
  examples: [
    [
      {
        input: { poolAddress: "PoolAddr...", pageSize: 5 },
        output: {
          status: "success",
          data: {
            positions: [
              {
                positionAddress: "PosAddr...",
                liquidityUsd: "50000",
                earnedUsd: "1200",
              },
            ],
            total: 50,
          },
        },
        explanation: "Get the top 5 positions for a Byreal pool",
      },
    ],
  ],
  schema: z.object({
    poolAddress: z
      .string()
      .describe("The pool address to query top positions for"),
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Results per page"),
    sortField: z
      .string()
      .optional()
      .describe("Sort by: liquidity, earned, pnl, copies, bonus"),
    sortType: z.string().optional().describe("Sort order: asc or desc"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealGetTopPositions(agent, {
        poolAddress: input.poolAddress,
        page: input.page,
        pageSize: input.pageSize,
        sortField: input.sortField,
        sortType: input.sortType,
      });
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Byreal top positions: ${error.message}`,
      };
    }
  },
};
