import type { SolanaAgentKit } from "solana-agent-kit";
import type { PumpDataResponse } from "../types";
import { pumpDataPaidRequest } from "./client";

/**
 * A pump.fun launch, historically: the deployer's record, the bundle at
 * creation, the insiders' share of supply, curve progress, and how launches
 * that looked the same at the same age went over their next 24 h.
 * Costs $0.005 in USDC, paid over x402 with the agent's wallet.
 *
 * @param agent - SolanaAgentKit instance whose wallet pays
 * @param mint - The coin's mint address
 */
export async function pumpdataGetLaunch(
  agent: SolanaAgentKit,
  mint: string,
): Promise<PumpDataResponse> {
  return pumpDataPaidRequest(
    agent,
    "launch",
    `/launch/${encodeURIComponent(mint)}`,
  );
}
