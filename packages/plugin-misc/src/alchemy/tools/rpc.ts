import type {
  AlchemyRequestOptions,
  JsonRpcResponse,
  AlchemyAgent as SolanaAgentKit,
} from "../types";
import {
  createAlchemyHeaders,
  fetchAlchemyJson,
  resolveAlchemyAuth,
} from "./client";
import { getAlchemySolanaRpcUrl, getAlchemyX402SolanaRpcUrl } from "./urls";

export async function alchemySolanaRpcRequest<T = unknown>(
  agent: SolanaAgentKit,
  method: string,
  params: unknown[] | Record<string, unknown> = [],
  options: AlchemyRequestOptions = {},
): Promise<T> {
  const auth = resolveAlchemyAuth(agent, options);
  const url =
    auth.mode === "api-key"
      ? getAlchemySolanaRpcUrl(agent, {
          ...options,
          apiKey: auth.apiKey,
        })
      : getAlchemyX402SolanaRpcUrl(agent, options);

  const response = await fetchAlchemyJson<JsonRpcResponse<T>>(url, {
    method: "POST",
    headers: createAlchemyHeaders(auth),
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: options.id ?? "alchemy-solana-rpc",
      method,
      params,
    }),
  });

  if (response.error) {
    throw new Error(
      `Alchemy JSON-RPC error ${response.error.code}: ${response.error.message}`,
    );
  }

  return response.result as T;
}

export async function alchemyGetPriorityFeeEstimate<T = unknown>(
  agent: SolanaAgentKit,
  params: unknown[] | Record<string, unknown>,
  options: AlchemyRequestOptions = {},
): Promise<T> {
  return alchemySolanaRpcRequest<T>(
    agent,
    "getPriorityFeeEstimate",
    params,
    options,
  );
}
