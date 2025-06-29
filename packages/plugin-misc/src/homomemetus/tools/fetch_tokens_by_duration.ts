import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokensByDuration
 * @description Filter tokens by duration creation timestamp included
 * @param       start, string, Start date (optional)
 * @param       end, string, End date (optional)
 * @param       sort, 'asc' or 'desc', Sorting order (optional)
 * @param       limit, number, Limit the number of items returned (optional)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_tokens_by_duration(
  start?: string,
  end?: string,
  sort?: "asc" | "desc",
  limit?: number
): Promise<TokenResponse[]> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokensByDuration({
      start,
      end,
      sort,
      limit,
    });

    return result;
  } catch (error) {
    throw error;
  }
}
