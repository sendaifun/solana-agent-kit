import { SolanaAgentKit } from "../../agent";
import { getQuote } from "../../tools/okx-dex/get_quote";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Creates a LangChain tool to get OKX DEX quote
 * @param agent SolanaAgentKit instance
 * @returns DynamicStructuredTool for getting quotes
 */
export function createOKXDexGetQuoteTool(agent: SolanaAgentKit) {
  return new DynamicStructuredTool({
    name: "get_okx_dex_quote",
    description: "Gets a quote for swapping tokens on OKX DEX",
    schema: z.object({
      fromTokenAddress: z.string().describe("Source token address"),
      toTokenAddress: z.string().describe("Target token address"),
      amount: z.string().describe("Amount to swap in base units"),
      slippage: z
        .string()
        .optional()
        .describe("Slippage tolerance (default: 0.5%)"),
    }),
    func: async ({
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage = "0.5",
    }) => {
      try {
        const result = await getQuote(
          agent,
          fromTokenAddress,
          toTokenAddress,
          amount,
          slippage,
        );
        return JSON.stringify(result);
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: error.message || "Failed to get quote",
        });
      }
    },
  });
}
