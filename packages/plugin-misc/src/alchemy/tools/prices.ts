import type {
  AlchemyPriceAddress,
  AlchemyRequestOptions,
  AlchemyAgent as SolanaAgentKit,
} from "../types";
import {
  createAlchemyHeaders,
  fetchAlchemyJson,
  resolveAlchemyAuth,
} from "./client";
import { getAlchemyPricesBaseUrl } from "./urls";

export async function alchemyGetTokenPricesBySymbol<T = unknown>(
  agent: SolanaAgentKit,
  symbols: string[],
  options: AlchemyRequestOptions = {},
): Promise<T> {
  if (!symbols.length) {
    throw new Error("At least one token symbol is required");
  }

  const auth = resolveAlchemyAuth(agent, options);
  const baseUrl = getAlchemyPricesBaseUrl(auth.apiKey);
  const url = new URL(`${baseUrl}/tokens/by-symbol`);
  url.searchParams.set("symbols", symbols.join(","));

  return fetchAlchemyJson<T>(url.toString(), {
    method: "GET",
    headers: createAlchemyHeaders(),
  });
}

export async function alchemyGetTokenPricesByAddress<T = unknown>(
  agent: SolanaAgentKit,
  addresses: AlchemyPriceAddress[],
  options: AlchemyRequestOptions = {},
): Promise<T> {
  if (!addresses.length) {
    throw new Error("At least one token address is required");
  }

  const auth = resolveAlchemyAuth(agent, options);
  const baseUrl = getAlchemyPricesBaseUrl(auth.apiKey);

  return fetchAlchemyJson<T>(`${baseUrl}/tokens/by-address`, {
    method: "POST",
    headers: createAlchemyHeaders(),
    body: JSON.stringify({ addresses }),
  });
}

export async function alchemyGetHistoricalTokenPrices<T = unknown>(
  agent: SolanaAgentKit,
  requestBody: Record<string, unknown>,
  options: AlchemyRequestOptions = {},
): Promise<T> {
  const auth = resolveAlchemyAuth(agent, options);
  const baseUrl = getAlchemyPricesBaseUrl(auth.apiKey);

  return fetchAlchemyJson<T>(`${baseUrl}/tokens/historical`, {
    method: "POST",
    headers: createAlchemyHeaders(),
    body: JSON.stringify(requestBody),
  });
}
