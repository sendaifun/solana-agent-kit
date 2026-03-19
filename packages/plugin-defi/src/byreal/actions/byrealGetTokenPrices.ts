import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealGetTokenPrices } from "../tools";

export const byrealGetTokenPricesAction: Action = {
  name: "BYREAL_GET_TOKEN_PRICES",
  similes: [
    "get byreal token prices",
    "byreal token price",
    "check price on byreal",
  ],
  description:
    "Get USD prices for multiple tokens by their mint addresses on Byreal",
  examples: [
    [
      {
        input: { mints: ["So11111111111111111111111111111111111111112"] },
        output: {
          status: "success",
          data: { So11111111111111111111111111111111111111112: 150.5 },
        },
        explanation: "Get the USD price of SOL on Byreal",
      },
    ],
  ],
  schema: z.object({
    mints: z
      .array(z.string())
      .describe("Token mint addresses to query prices for"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealGetTokenPrices(agent, input.mints);
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Byreal token prices: ${error.message}`,
      };
    }
  },
};
