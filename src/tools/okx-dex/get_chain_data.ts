import { SolanaAgentKit } from "../../index";
import { initDexClient } from "./utils";

/**
 * Get chain data from OKX DEX
 * @param agent SolanaAgentKit instance
 * @returns Chain data from OKX DEX
 */
export async function getChainData(agent: SolanaAgentKit): Promise<any> {
  try {
    const dexClient = initDexClient(agent);
    const chains = await dexClient.dex.getChainData("501");
    return chains;
  } catch (error: any) {
    return {
      status: "error",
      message: error.message || "Failed to get chain data",
    };
  }
}
