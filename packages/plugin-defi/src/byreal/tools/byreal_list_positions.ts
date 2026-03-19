import type {
  PositionListParams,
  PositionListResult,
} from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealListPositions(
  agent: SolanaAgentKit,
  params?: Omit<PositionListParams, "userAddress"> & { userAddress?: string },
): Promise<PositionListResult> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.positions.list({
    ...params,
    userAddress: params?.userAddress ?? agent.wallet.publicKey.toBase58(),
  });
  return unwrapResult(result);
}
