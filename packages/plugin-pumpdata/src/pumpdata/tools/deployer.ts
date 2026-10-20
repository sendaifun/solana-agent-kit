import type { SolanaAgentKit } from "solana-agent-kit";
import type { PumpDataResponse } from "../types";
import { pumpDataPaidRequest } from "./client";

/**
 * A pump.fun deployer's record with no coin needed: launches, graduations,
 * best run, gaps between launches, how its launches of the last 90 days went,
 * and the base rate for its next launch from deployers with the same record.
 * Costs $0.005 in USDC, paid over x402 with the agent's wallet.
 *
 * @param agent - SolanaAgentKit instance whose wallet pays
 * @param address - The deployer's wallet address
 */
export async function pumpdataGetDeployer(
  agent: SolanaAgentKit,
  address: string,
): Promise<PumpDataResponse> {
  return pumpDataPaidRequest(
    agent,
    "deployer",
    `/deployer/${encodeURIComponent(address)}`,
  );
}
