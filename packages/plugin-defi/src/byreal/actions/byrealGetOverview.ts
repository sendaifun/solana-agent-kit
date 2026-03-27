import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealGetOverview } from "../tools";

export const byrealGetOverviewAction: Action = {
  name: "BYREAL_GET_OVERVIEW",
  similes: [
    "byreal overview",
    "byreal dex stats",
    "byreal tvl",
    "byreal volume",
  ],
  description:
    "Get global Byreal DEX statistics including TVL, 24h volume, and fees",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          data: {
            tvl: 50000000,
            volume_24h_usd: 12000000,
            fee_24h_usd: 24000,
          },
        },
        explanation: "Get Byreal DEX global overview statistics",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, _input: Record<string, any>) => {
    try {
      const data = await byrealGetOverview(agent);
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Byreal overview: ${error.message}`,
      };
    }
  },
};
