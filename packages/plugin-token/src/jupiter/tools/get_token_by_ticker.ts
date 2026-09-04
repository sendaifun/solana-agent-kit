import type { JupiterTokenData, JupiterTokenV2 } from "../types";
import { JUP_TOKEN_API } from "./utils/constants";
import { toJupiterTokenData } from "./utils/token";

/**
 * Fetches token data by ticker
 * @param ticker of the token
 */
export async function getTokenByTicker(
  ticker: string,
): Promise<JupiterTokenData> {
  try {
    const response = await fetch(`${JUP_TOKEN_API}/tag?query=verified`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tokens: ${response.statusText}`);
    }

    // v2 records are keyed differently from JupiterTokenData; map after picking.
    const data: JupiterTokenV2[] = await response.json();

    const tokenData = data
      // sort in decreasing 24h volume
      .toSorted(
        (a, b) =>
          (b.stats24h?.buyVolume ?? 0) +
          (b.stats24h?.sellVolume ?? 0) -
          ((a.stats24h?.buyVolume ?? 0) + (a.stats24h?.sellVolume ?? 0)),
      )
      .find((token) => token.symbol.toLowerCase() === ticker.toLowerCase());

    if (!tokenData) {
      throw new Error("Token data not available for the given ticker.");
    }

    return toJupiterTokenData(tokenData);
  } catch (e) {
    // @ts-expect-error - error is any
    throw new Error(`Token fetch failed: ${e.message}`);
  }
}
