import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealGetPoolDetail } from "../tools";

export const byrealGetPoolDetailAction: Action = {
  name: "BYREAL_GET_POOL_DETAIL",
  similes: [
    "get byreal pool detail",
    "byreal pool info",
    "show byreal pool",
    "byreal pool stats",
  ],
  description:
    "Get detailed information about a Byreal pool including TVL, APR, price, fee rate, and rewards",
  examples: [
    [
      {
        input: { poolAddress: "PoolAddr..." },
        output: {
          status: "success",
          data: {
            id: "PoolAddr...",
            pair: "SOL/USDC",
            tvl_usd: 1500000,
            apr: 12.5,
          },
        },
        explanation: "Get detailed info for a specific Byreal pool",
      },
    ],
  ],
  schema: z.object({
    poolAddress: z.string().describe("The Byreal pool address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealGetPoolDetail(agent, input.poolAddress);
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Byreal pool detail: ${error.message}`,
      };
    }
  },
};
