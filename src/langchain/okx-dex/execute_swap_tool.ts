import { SolanaAgentKit } from "../../agent";
import { executeSwap } from "../../tools/okx-dex/execute_swap";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Creates a LangChain tool to execute swaps on OKX DEX
 * @param agent SolanaAgentKit instance
 * @returns DynamicStructuredTool for executing swaps
 */
export function createOKXDexExecuteSwapTool(agent: SolanaAgentKit) {
  return new DynamicStructuredTool({
    name: "execute_okx_dex_swap",
    description: "Executes a token swap on OKX DEX",
    schema: z.object({
      fromTokenAddress: z.string().describe("Source token address"),
      toTokenAddress: z.string().describe("Target token address"),
      amount: z.string().describe("Amount to swap in base units"),
      slippage: z
        .string()
        .optional()
        .describe("Slippage tolerance (default: 0.5%)"),
      autoSlippage: z
        .boolean()
        .optional()
        .describe("Use auto slippage (default: false)"),
      maxAutoSlippageBps: z
        .string()
        .optional()
        .describe("Maximum auto slippage in basis points (default: 100 = 1%)"),
      userWalletAddress: z
        .string()
        .optional()
        .describe("User wallet address (default: agent's wallet address)"),
    }),
    func: async ({
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage = "0.5",
      autoSlippage = false,
      maxAutoSlippageBps = "100",
      userWalletAddress,
    }) => {
      try {
        const result = await executeSwap(
          agent,
          fromTokenAddress,
          toTokenAddress,
          amount,
          slippage,
          autoSlippage,
          maxAutoSlippageBps,
          userWalletAddress,
        );
        return JSON.stringify(result);
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: error.message || "Failed to execute swap",
        });
      }
    },
  });
}
