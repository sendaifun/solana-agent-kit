import { SolanaAgentKit } from "../../agent";
import { getTokens } from "../../tools/okx-dex/get_tokens";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Creates a LangChain tool to get OKX DEX tokens
 * @param agent SolanaAgentKit instance
 * @returns DynamicStructuredTool for getting tokens
 */
export function createOKXDexGetTokensTool(agent: SolanaAgentKit) {
  return new DynamicStructuredTool({
    name: "get_okx_dex_tokens",
    description: "Gets a list of all tokens available on OKX DEX",
    schema: z.object({}),
    func: async () => {
      try {
        const result = await getTokens(agent);
        return JSON.stringify(result);
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: error.message || "Failed to get tokens",
        });
      }
    },
  });
}
