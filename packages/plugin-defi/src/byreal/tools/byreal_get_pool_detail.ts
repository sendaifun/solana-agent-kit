import type { PoolDetail } from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealGetPoolDetail(
  agent: SolanaAgentKit,
  poolAddress: string,
): Promise<PoolDetail> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.pools.getDetail(poolAddress);
  return unwrapResult(result);
}
