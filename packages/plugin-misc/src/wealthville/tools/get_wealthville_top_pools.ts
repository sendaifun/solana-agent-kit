import { SolanaAgentKit } from "solana-agent-kit";
import { WealthvilleTopPoolsResponse } from "../types";
import { wealthvilleGet } from "../utils";

/**
 * List liquidity pools ranked by composite Wealthville Score (0-100),
 * freshly scored within the last 6 hours.
 * @param agent SolanaAgentKit instance
 * @param limit How many pools to return (1-100, default 25)
 * @param chain "solana" (default), "evm" for all EVM chains, or one EVM chain name
 */
export async function getWealthvilleTopPools(
  agent: SolanaAgentKit,
  limit: number = 25,
  chain: string = "solana",
): Promise<WealthvilleTopPoolsResponse> {
  return wealthvilleGet(
    agent,
    `/api/v1/scores/top?limit=${limit}&chain=${encodeURIComponent(chain)}`,
  );
}
