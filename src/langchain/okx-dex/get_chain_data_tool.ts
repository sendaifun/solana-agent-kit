import { SolanaAgentKit } from "../../agent";
import { getChainData } from "../../tools/okx-dex/get_chain_data";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Creates a LangChain tool to get OKX DEX chain data
 * @param agent SolanaAgentKit instance
 * @returns DynamicStructuredTool for getting chain data
 */
export function createOKXDexGetChainDataTool(agent: SolanaAgentKit) {
  return new DynamicStructuredTool({
    name: "get_okx_dex_chain_data",
    description: "Gets chain data from OKX DEX",
    schema: z.object({}),
    func: async () => {
      try {
        const result = await getChainData(agent);
        return JSON.stringify(result);
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: error.message || "Failed to get chain data",
        });
      }
    },
  });
}
