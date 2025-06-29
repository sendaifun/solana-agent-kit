import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokensByInitializers
 * @description Filter tokens created by a specific initializers
 * @param       addresses, string[], List of creators addresses (required)
 * @param       sort, 'asc' or 'desc', Sorting order (optional)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_tokens_by_initializers(
  addresses: string[],
  sort?: "asc" | "desc"
): Promise<TokenResponse[]> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokensByInitializers({ addresses, sort });

    return result;
  } catch (error) {
    throw error;
  }
}
