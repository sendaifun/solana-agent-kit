import { SODAX_API, SodaxTokensResponse } from "../types";

/**
 * Fetch all swap-supported tokens from SODAX, keyed by chain.
 *
 * @param chainKey Optional chain key to filter results (e.g., "solana", "0x2105.base")
 * @param apiKey Optional SODAX API key from portal.sodax.com
 */
export async function getSodaxTokens(
  chainKey?: string,
  apiKey?: string,
): Promise<SodaxTokensResponse> {
  const path = chainKey ? `/tokens/${encodeURIComponent(chainKey)}` : "/tokens";
  const headers: HeadersInit = { "content-type": "application/json" };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(`${SODAX_API}${path}`, {
    headers,
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SODAX /tokens failed: ${response.status} - ${text}`);
  }

  const data = await response.json();
  // When a chainKey is passed the API returns an array; normalise to the same map shape.
  if (chainKey && Array.isArray(data)) {
    return { [chainKey]: data };
  }
  return data as SodaxTokensResponse;
}
