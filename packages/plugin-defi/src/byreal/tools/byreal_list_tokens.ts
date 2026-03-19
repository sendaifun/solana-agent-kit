import type {
  PaginatedResult,
  Token,
  TokenListParams,
} from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealListTokens(
  agent: SolanaAgentKit,
  params?: TokenListParams,
): Promise<PaginatedResult<Token>> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.tokens.list(params);
  return unwrapResult(result);
}
