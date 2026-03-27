import type {
  PaginatedResult,
  Pool,
  PoolListParams,
} from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealListPools(
  agent: SolanaAgentKit,
  params?: PoolListParams,
): Promise<PaginatedResult<Pool>> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.pools.list(params);
  return unwrapResult(result);
}
