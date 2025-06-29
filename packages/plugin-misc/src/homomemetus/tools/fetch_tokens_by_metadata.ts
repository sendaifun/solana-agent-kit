import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokensByMetadata
 * @description Filter tokens by metadata
 * @param       name, string, Filter by name (optional)
 * @param       symbol, string, Filter by symbol (optional)
 * @param       sort, 'asc' or 'desc', Sorting order (optional)
 * @param       limit, number, Limit the number of items returned (optional)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_tokens_by_metadata(
  name?: string,
  symbol?: string,
  sort?: "asc" | "desc",
  limit?: number
): Promise<TokenResponse[]> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokensByMetadata({
      name,
      symbol,
      sort,
      limit,
    });

    return result;
  } catch (error) {
    throw error;
  }
}
