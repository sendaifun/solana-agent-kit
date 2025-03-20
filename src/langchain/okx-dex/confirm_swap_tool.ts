import { SolanaAgentKit } from "../../agent";
import { executeSwap } from "../../tools/okx-dex/execute_swap";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// This would typically store the pending swap in memory or in a database
let pendingSwap: any = null;

/**
 * Creates a LangChain tool to confirm swaps on OKX DEX
 * @param agent SolanaAgentKit instance
 * @returns DynamicStructuredTool for confirming swaps
 */
export function createOKXDexConfirmSwapTool(agent: SolanaAgentKit) {
  return new DynamicStructuredTool({
    name: "confirm_okx_dex_swap",
    description: "Confirms and executes a pending token swap on OKX DEX",
    schema: z.object({}),
    func: async () => {
      try {
        if (!pendingSwap) {
          return JSON.stringify({
            status: "error",
            message: "No pending swap to confirm",
          });
        }

        const {
          fromTokenAddress,
          toTokenAddress,
          amount,
          slippage,
          autoSlippage,
          maxAutoSlippageBps,
          userWalletAddress,
        } = pendingSwap;

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

        // Clear the pending swap
        pendingSwap = null;

        return JSON.stringify(result);
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: error.message || "Failed to confirm swap",
        });
      }
    },
  });
}

/**
 * Set a pending swap to be confirmed later
 * @param swap Swap details
 */
export function setPendingSwap(swap: any) {
  pendingSwap = swap;
}

/**
 * Clear any pending swap
 */
export function clearPendingSwap() {
  pendingSwap = null;
}
