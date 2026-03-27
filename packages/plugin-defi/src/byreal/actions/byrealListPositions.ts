import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealListPositions } from "../tools";

export const byrealListPositionsAction: Action = {
  name: "BYREAL_LIST_POSITIONS",
  similes: [
    "list byreal positions",
    "my byreal positions",
    "show byreal liquidity positions",
  ],
  description:
    "List CLMM liquidity positions on Byreal DEX for a user (defaults to agent wallet)",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          data: {
            positions: [
              {
                positionAddress: "PosAddr...",
                pair: "SOL/USDC",
                liquidityUsd: "1000",
              },
            ],
            total: 1,
          },
        },
        explanation: "List the agent wallet's positions on Byreal",
      },
    ],
  ],
  schema: z.object({
    userAddress: z
      .string()
      .optional()
      .describe("Wallet address (defaults to agent wallet)"),
    poolAddress: z.string().optional().describe("Filter by pool address"),
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Results per page"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealListPositions(agent, {
        userAddress: input.userAddress,
        poolAddress: input.poolAddress,
        page: input.page,
        pageSize: input.pageSize,
      });
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to list Byreal positions: ${error.message}`,
      };
    }
  },
};
