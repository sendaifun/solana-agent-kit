import type { SolanaAgentKit } from "solana-agent-kit";
import type { PumpDataBaseRateParams, PumpDataResponse } from "../types";
import { pumpDataPaidRequest } from "./client";

/**
 * How often coins that first traded inside a market cap band went on to 2x,
 * 5x, 10x and 20x within 3 h, over a window of up to 31 days, with the median
 * peak. Dead coins are counted.
 * Costs $0.005 in USDC, paid over x402 with the agent's wallet.
 *
 * @param agent - SolanaAgentKit instance whose wallet pays
 * @param params - Band such as "15k-28k", ISO window, and venue
 */
export async function pumpdataGetBaseRate(
  agent: SolanaAgentKit,
  params: PumpDataBaseRateParams,
): Promise<PumpDataResponse> {
  if (!/^[0-9]+k-[0-9]+k$/.test(params.band)) {
    throw new Error('band must look like "15k-28k"');
  }
  const query = new URLSearchParams({
    band: params.band,
    from: params.from,
    to: params.to,
    venue: params.venue ?? "any",
  });
  return pumpDataPaidRequest(agent, "baserate", `/baserate?${query}`);
}
