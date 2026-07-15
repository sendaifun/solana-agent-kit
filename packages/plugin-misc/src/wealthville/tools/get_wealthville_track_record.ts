import { SolanaAgentKit } from "solana-agent-kit";
import { WealthvilleTrackRecordResponse } from "../types";
import { wealthvilleGet } from "../utils";

/**
 * Get Wealthville's live, outcome-labeled signal track record: per-action hit
 * rates and IL-adjusted 7-day PnL, misses included. Every published signal is
 * immutable at publish time and labeled after the fact.
 * @param agent SolanaAgentKit instance
 * @param days Window in days (7-90, default 30)
 */
export async function getWealthvilleTrackRecord(
  agent: SolanaAgentKit,
  days: number = 30,
): Promise<WealthvilleTrackRecordResponse> {
  return wealthvilleGet(agent, `/api/v1/track-record?days=${days}`);
}
