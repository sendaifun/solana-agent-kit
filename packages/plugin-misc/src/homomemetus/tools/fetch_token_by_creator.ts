import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokenByCreator
 * @description Fetch tokens filter with created by a specific creator
 * @param       address, string, address of creator (required)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_token_by_creator(
  address: string
): Promise<TokenResponse> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokenByCreator(address);

    return result;
  } catch (error) {
    throw error;
  }
}
