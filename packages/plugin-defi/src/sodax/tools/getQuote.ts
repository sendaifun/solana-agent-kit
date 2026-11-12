import { SODAX_API, SodaxQuoteInput, SodaxQuoteResponse } from "../types";

/**
 * Get a firm quote for a SODAX cross-chain swap.
 *
 * @param params Quote parameters
 * @param apiKey Optional SODAX API key
 */
export async function getSodaxQuote(
  params: SodaxQuoteInput,
  apiKey?: string,
): Promise<SodaxQuoteResponse> {
  const headers: HeadersInit = { "content-type": "application/json" };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(`${SODAX_API}/quote`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      tokenSrc: params.tokenSrc,
      tokenSrcChainKey: params.tokenSrcChainKey,
      tokenDst: params.tokenDst,
      tokenDstChainKey: params.tokenDstChainKey,
      amount: params.amount,
      quoteType: params.quoteType ?? "exact_input",
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SODAX /quote failed: ${response.status} - ${text}`);
  }

  const data = await response.json();
  if (data.message && !data.quotedAmount) {
    throw new Error(`SODAX quote error: ${data.message}`);
  }
  return data as SodaxQuoteResponse;
}
