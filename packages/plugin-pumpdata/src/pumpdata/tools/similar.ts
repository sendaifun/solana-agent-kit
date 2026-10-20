import type { SolanaAgentKit } from "solana-agent-kit";
import type { PumpDataResponse } from "../types";
import { pumpDataPaidRequest } from "./client";

/**
 * The past launches most like this one at the same age, named by mint, and
 * how each went over its next 24 h (peak, close, dead or graduated), with a
 * sentence on why each is similar. Not a prediction.
 * Costs $0.005 in USDC, paid over x402 with the agent's wallet.
 *
 * @param agent - SolanaAgentKit instance whose wallet pays
 * @param mint - The coin's mint address
 * @param limit - How many comparable launches to return, 1 to 25 (default 10)
 */
export async function pumpdataGetSimilar(
  agent: SolanaAgentKit,
  mint: string,
  limit?: number,
): Promise<PumpDataResponse> {
  if (
    limit !== undefined &&
    (!Number.isInteger(limit) || limit < 1 || limit > 25)
  ) {
    throw new Error("limit must be an integer from 1 to 25");
  }
  const query = limit !== undefined ? `?limit=${limit}` : "";
  return pumpDataPaidRequest(
    agent,
    "similar",
    `/similar/${encodeURIComponent(mint)}${query}`,
  );
}
