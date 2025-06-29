import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchOldestTokens
 * @description Fetch oldest token list in token list created in 24h
 * @param       limit, number, Limit the number of oldest items returned (optional)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */

export async function fetch_oldest_tokens(
  limit?: number
): Promise<TokenResponse[]> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchOldestTokens({ limit });

    return result;
  } catch (error) {
    throw error;
  }
}
