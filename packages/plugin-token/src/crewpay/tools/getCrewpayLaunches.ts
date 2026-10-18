import type { SolanaAgentKit } from "solana-agent-kit";
import { crewpayFetch, getCrewpayApiKey } from "./client";

/**
 * List coins launched with this agent's CrewPay API key
 * (mint, ticker, feeShareLocked, coin page).
 * @param agent - SolanaAgentKit instance
 * @param limit - Max launches to return (1-100, default 20)
 */
export async function getCrewpayLaunches(
  agent: SolanaAgentKit,
  limit = 20,
): Promise<any> {
  const apiKey = getCrewpayApiKey(agent);
  const n = Math.min(100, Math.max(1, Math.floor(limit)));
  return crewpayFetch(`/api/agent/launches?limit=${n}`, { apiKey });
}
