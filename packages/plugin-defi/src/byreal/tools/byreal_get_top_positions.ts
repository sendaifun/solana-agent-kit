import type {
  TopPositionsParams,
  TopPositionsResult,
} from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealGetTopPositions(
  agent: SolanaAgentKit,
  params: TopPositionsParams,
): Promise<TopPositionsResult> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.copyFarmer.getTopPositions(params);
  return unwrapResult(result);
}
