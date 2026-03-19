import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealSwap } from "../tools";

export const byrealSwapAction: Action = {
  name: "BYREAL_SWAP",
  similes: [
    "swap on byreal",
    "trade on byreal dex",
    "byreal token swap",
    "exchange tokens on byreal",
  ],
  description: "Execute a token swap on Byreal DEX",
  examples: [
    [
      {
        input: {
          inputMint: "So11111111111111111111111111111111111111112",
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          amount: "1000000000",
        },
        output: {
          status: "success",
          message: "Swap executed successfully on Byreal",
          data: { signatures: ["5QNZ..."], confirmed: true },
        },
        explanation: "Swap 1 SOL for USDC on Byreal DEX",
      },
    ],
  ],
  schema: z.object({
    inputMint: z.string().describe("Input token mint address"),
    outputMint: z.string().describe("Output token mint address"),
    amount: z.string().describe("Amount of input token in smallest units"),
    slippageBps: z
      .number()
      .optional()
      .describe("Slippage tolerance in basis points"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await byrealSwap(
        agent,
        input.inputMint,
        input.outputMint,
        input.amount,
        input.slippageBps,
      );
      return {
        status: "success",
        message: "Swap executed successfully on Byreal",
        data: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to execute Byreal swap: ${error.message}`,
      };
    }
  },
};
