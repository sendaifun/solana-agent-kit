import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealCopyPosition } from "../tools";

export const byrealCopyPositionAction: Action = {
  name: "BYREAL_COPY_POSITION",
  similes: [
    "copy byreal position",
    "byreal copy farmer",
    "replicate byreal position",
  ],
  description:
    "Copy a top-performing Byreal CLMM position by opening an identical position with your own funds",
  examples: [
    [
      {
        input: {
          sourcePositionAddress: "PosAddr...",
          amountUsd: 500,
        },
        output: {
          status: "success",
          message: "Position copied successfully on Byreal",
          data: { signature: "5QNZ...", confirmed: true },
        },
        explanation: "Copy a top position with $500 investment",
      },
    ],
  ],
  schema: z.object({
    sourcePositionAddress: z
      .string()
      .describe("Address of the position to copy"),
    amountUsd: z.number().positive().describe("Investment amount in USD"),
    slippageBps: z
      .number()
      .optional()
      .describe("Slippage tolerance in basis points"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await byrealCopyPosition(
        agent,
        input.sourcePositionAddress,
        input.amountUsd,
        input.slippageBps,
      );
      return {
        status: "success",
        message: "Position copied successfully on Byreal",
        data: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to copy Byreal position: ${error.message}`,
      };
    }
  },
};
