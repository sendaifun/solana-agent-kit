import { SolanaAgentKit } from "../../agent";
import { getLiquidity } from "../../tools/okx-dex/get_liquidity";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Creates a LangChain tool to get OKX DEX liquidity
 * @param agent SolanaAgentKit instance
 * @returns DynamicStructuredTool for getting liquidity
 */
export function createOKXDexGetLiquidityTool(agent: SolanaAgentKit) {
  return new DynamicStructuredTool({
    name: "get_okx_dex_liquidity",
    description: "Gets liquidity information from OKX DEX",
    schema: z.object({}),
    func: async () => {
      try {
        const result = await getLiquidity(agent, "501"); // Solana chain ID
        return JSON.stringify(result);
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: error.message || "Failed to get liquidity information",
        });
      }
    },
  });
}
