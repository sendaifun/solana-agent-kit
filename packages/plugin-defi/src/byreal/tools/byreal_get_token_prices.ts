import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealGetTokenPrices(
  agent: SolanaAgentKit,
  mints: string[],
): Promise<Record<string, number>> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.tokens.getPrices(mints);
  return unwrapResult(result);
}
