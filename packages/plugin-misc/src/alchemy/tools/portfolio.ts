import type {
  AlchemyPortfolioTokensRequest,
  AlchemyRequestOptions,
  AlchemyAgent as SolanaAgentKit,
} from "../types";
import {
  createAlchemyHeaders,
  fetchAlchemyJson,
  resolveAlchemyAuth,
} from "./client";
import { getAlchemyPortfolioBaseUrl } from "./urls";

export async function alchemyGetPortfolioTokens<T = unknown>(
  agent: SolanaAgentKit,
  requestBody: AlchemyPortfolioTokensRequest,
  options: AlchemyRequestOptions = {},
): Promise<T> {
  if (!requestBody.addresses.length) {
    throw new Error("At least one wallet address is required");
  }

  const auth = resolveAlchemyAuth(agent, options);
  const baseUrl = getAlchemyPortfolioBaseUrl(auth.apiKey);

  return fetchAlchemyJson<T>(`${baseUrl}/assets/tokens/by-address`, {
    method: "POST",
    headers: createAlchemyHeaders(),
    body: JSON.stringify(requestBody),
  });
}
