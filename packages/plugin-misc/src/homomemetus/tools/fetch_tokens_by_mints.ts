import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokensByMints
 * @description Filter by a specific token addresses
 * @param       addresses, string[], List of tokens mint addresses (required)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_tokens_by_mints(
  addresses: string[]
): Promise<TokenResponse[]> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokensByAddresses(addresses);

    return result;
  } catch (error) {
    throw error;
  }
}
