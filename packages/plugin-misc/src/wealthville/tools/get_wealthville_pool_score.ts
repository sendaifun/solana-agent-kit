import { SolanaAgentKit } from "solana-agent-kit";
import { WealthvilleScoreRow } from "../types";
import { wealthvilleGet } from "../utils";

/**
 * Get the Wealthville verdict (ENTER/HOLD/EXIT/AVOID) and 0-100 action scores
 * for one liquidity pool.
 * @param agent SolanaAgentKit instance
 * @param poolAddress Pool address — Solana base58, EVM 0x, or DefiLlama UUID
 */
export async function getWealthvillePoolScore(
  agent: SolanaAgentKit,
  poolAddress: string,
): Promise<WealthvilleScoreRow> {
  return wealthvilleGet(
    agent,
    `/api/v1/scores/${encodeURIComponent(poolAddress)}`,
  );
}
