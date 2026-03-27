import type { GlobalOverview } from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealGetOverview(
  agent: SolanaAgentKit,
): Promise<GlobalOverview> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.overview.getGlobal();
  return unwrapResult(result);
}
