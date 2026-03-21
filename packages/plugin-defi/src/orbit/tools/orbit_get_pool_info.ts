import type { SolanaAgentKit } from "solana-agent-kit";
import { ORBIT_API_BASE } from "./constants";

/**
 * Get full metadata for an Orbit Finance DLMM pool.
 * Returns TVL, 24h volume, reserves, fee tier, bin step, and token details.
 *
 * @param agent  SolanaAgentKit instance
 * @param poolId Pool public key (base58)
 * @returns JSON string with full pool metadata
 */
export async function orbitGetPoolInfo(
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

    const pool = await res.json();
    return JSON.stringify(pool);
  } catch (error: any) {
    throw new Error(`Orbit get pool info failed: ${error.message}`);
  }
}
