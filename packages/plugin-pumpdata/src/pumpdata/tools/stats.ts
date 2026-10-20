import type { SolanaAgentKit } from "solana-agent-kit";
import type { PumpDataResponse } from "../types";
import { pumpDataFreeGet } from "./client";

/**
 * Fetches pumpdata.fun's free daily summary of pump.fun: one UTC day of
 * launches, graduations, volume, traders, top coins and deployers.
 *
 * @param _agent - SolanaAgentKit instance (unused: this call is free)
 * @param day - Optional past UTC day as YYYY-MM-DD; omit for yesterday
 * @returns The day's stats; numbers listed in `checks` failed a sanity check
 */
export async function pumpdataGetStats(
  _agent: SolanaAgentKit,
  day?: string,
): Promise<PumpDataResponse> {
  if (day !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("day must be a UTC date as YYYY-MM-DD");
  }
  return pumpDataFreeGet(day ? `/stats/${day}.json` : "/stats.json");
}
