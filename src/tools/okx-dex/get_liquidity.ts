import { SolanaAgentKit } from "../../index";
import { initDexClient } from "./utils";

/**
 * Get liquidity information from OKX DEX
 * @param agent SolanaAgentKit instance
 * @param chainId Chain ID to query liquidity for
 * @returns Liquidity data from OKX DEX
 */
export async function getLiquidity(
  agent: SolanaAgentKit,
  chainId: string,
): Promise<any> {
  try {
    const dexClient = initDexClient(agent);
    const liquidity = await dexClient.dex.getLiquidity(chainId);
    return liquidity;
  } catch (error: any) {
    return {
      status: "error",
      message: error.message || "Failed to get liquidity information",
    };
  }
}
