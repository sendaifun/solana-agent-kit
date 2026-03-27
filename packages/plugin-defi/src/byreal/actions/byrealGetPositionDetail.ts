import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealGetPositionDetail } from "../tools";

export const byrealGetPositionDetailAction: Action = {
  name: "BYREAL_GET_POSITION_DETAIL",
  similes: [
    "get byreal position detail",
    "byreal position info",
    "show byreal position",
  ],
  description: "Get detailed information about a specific Byreal CLMM position",
  examples: [
    [
      {
        input: { positionAddress: "PosAddr..." },
        output: {
          status: "success",
          data: { positionAddress: "PosAddr...", liquidityUsd: "1000" },
        },
        explanation: "Get detail for a specific Byreal position",
      },
    ],
  ],
  schema: z.object({
    positionAddress: z.string().describe("The position address to query"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealGetPositionDetail(agent, input.positionAddress);
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Byreal position detail: ${error.message}`,
      };
    }
  },
};
