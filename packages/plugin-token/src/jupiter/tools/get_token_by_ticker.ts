import type { JupiterTokenData } from "../types";

/**
 * Fetches token data by ticker
 * @param ticker of the token
 */
export async function getTokenByTicker(
  ticker: string,
): Promise<JupiterTokenData> {
  try {
    const response = await fetch(
      "https://lite-api.jup.ag/tokens/v2/tag?query=verified",
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data: JupiterTokenData[] = await response.json();

    const tokenData = data
      // sort in decreasing daily volume
      .toSorted((a, b) => (b.daily_volume ?? 0) - (a.daily_volume ?? 0))
      .find(
        (token: JupiterTokenData) =>
          token.symbol.toLowerCase() === ticker.toLowerCase(),
      );

    if (!tokenData) {
      throw new Error("Token data not available for the given ticker.");
    }

    return tokenData;
  } catch (e) {
    // @ts-expect-error - error is any
    throw new Error(`Token fetch failed: ${e.message}`);
  }
}
