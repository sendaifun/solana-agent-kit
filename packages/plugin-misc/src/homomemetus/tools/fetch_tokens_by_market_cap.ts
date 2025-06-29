import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokensByMarketCap
 * @description Filter tokens by market cap included
 * @param       min, string, Minimum market cap (optional)
 * @param       max, string, Maximum market cap (optional)
 * @param       sort, 'asc' or 'desc', Sorting order (optional)
 * @param       limit, number, Limit the number of items returned (optional)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_tokens_by_market_cap(
  min?: string,
  max?: string,
  sort?: "asc" | "desc",
  limit?: number
): Promise<TokenResponse[]> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokensByMarketCap({
      min,
      max,
      sort,
      limit,
    });

    return result;
  } catch (error) {
    throw error;
  }
}
