import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokensByCreators
 * @description Filter tokens created by a specific creator
 * @param       addresses, string[], List of creators addresses (required)
 * @param       sort, 'asc' or 'desc', Sorting order (optional)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_tokens_by_creators(
  addresses: string[],
  sort?: "asc" | "desc"
): Promise<TokenResponse[]> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokensByCreators({ addresses, sort });

    return result;
  } catch (error) {
    throw error;
  }
}
