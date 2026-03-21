import type { SolanaAgentKit } from "solana-agent-kit";
import { ORBIT_API_BASE } from "./constants";

/**
 * Get the current USD price for an Orbit Finance DLMM pool.
 *
 * @param agent  SolanaAgentKit instance
 * @param poolId Pool public key (base58)
 * @returns JSON string with priceUsd, activeBinId, tokenX, tokenY
 */
export async function orbitGetPrice(
  agent: SolanaAgentKit,
  poolId: string
): Promise<string> {
  try {
    const url = `${ORBIT_API_BASE}/pools/${poolId}`;
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Orbit API ${res.status}: ${body}`);
    }

    const pool = (await res.json()) as {
      priceUsd: number;
      activeBinId: number;
      binStep: number;
      feeRate: number;
      reserveX: string;
      reserveY: string;
      tvlUsd: number;
      volume24hUsd: number;
      tokenX: { mint: string; symbol: string; decimals: number };
      tokenY: { mint: string; symbol: string; decimals: number };
    };

    return JSON.stringify({
      poolId,
      priceUsd: pool.priceUsd,
      activeBinId: pool.activeBinId,
      binStep: pool.binStep,
      feeRateBps: pool.feeRate,
      tvlUsd: pool.tvlUsd,
      volume24hUsd: pool.volume24hUsd,
      tokenX: pool.tokenX,
      tokenY: pool.tokenY,
    });
  } catch (error: any) {
    throw new Error(`Orbit get price failed: ${error.message}`);
  }
}
