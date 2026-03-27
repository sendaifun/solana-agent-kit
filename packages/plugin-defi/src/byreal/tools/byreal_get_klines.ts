import type { Kline, KlineParams } from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealGetKlines(
  agent: SolanaAgentKit,
  params: KlineParams,
): Promise<Kline[]> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.pools.getKlines(params);
  return unwrapResult(result);
}
