import { SolanaAgentKit } from "../../index";
import { initDexClient } from "./utils";

/**
 * Get quote for token swap on OKX DEX
 * @param agent SolanaAgentKit instance
 * @param fromTokenAddress Source token address
 * @param toTokenAddress Target token address
 * @param amount Amount to swap in base units
 * @param slippage Slippage tolerance (optional)
 * @returns Quote response
 */
export async function getQuote(
  agent: SolanaAgentKit,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippage: string = "0.5",
): Promise<any> {
  try {
    const dexClient = initDexClient(agent);
    const quote = await dexClient.dex.getQuote({
      chainId: "501",
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage,
    });
    return quote;
  } catch (error: any) {
    return {
      status: "error",
      message: error.message || "Failed to get quote",
    };
  }
}
