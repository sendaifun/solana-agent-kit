import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealGetPositionDetail(
  agent: SolanaAgentKit,
  positionAddress: string,
): Promise<Record<string, unknown>> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.positions.getDetail(positionAddress);
  return unwrapResult(result);
}
