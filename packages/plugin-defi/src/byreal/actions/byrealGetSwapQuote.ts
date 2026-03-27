import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealGetSwapQuote } from "../tools";

export const byrealGetSwapQuoteAction: Action = {
  name: "BYREAL_GET_SWAP_QUOTE",
  similes: [
    "byreal swap quote",
    "byreal swap preview",
    "get byreal swap price",
    "preview byreal swap",
  ],
  description:
    "Get a swap quote (preview) from Byreal DEX without executing the trade",
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
          data: {
            inAmount: "1000000000",
            outAmount: "150000000",
            routerType: "AMM",
          },
        },
        explanation: "Preview swapping 1 SOL to USDC on Byreal",
      },
    ],
  ],
  schema: z.object({
    inputMint: z.string().describe("Input token mint address"),
    outputMint: z.string().describe("Output token mint address"),
    amount: z.string().describe("Amount in smallest units"),
    swapMode: z
      .enum(["in", "out"])
      .optional()
      .describe("Swap mode: in (exact input) or out (exact output)"),
    slippageBps: z
      .number()
      .optional()
      .describe("Slippage tolerance in basis points"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const data = await byrealGetSwapQuote(
        agent,
        input.inputMint,
        input.outputMint,
        input.amount,
        input.swapMode,
        input.slippageBps,
      );
      return { status: "success", data };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Byreal swap quote: ${error.message}`,
      };
    }
  },
};
