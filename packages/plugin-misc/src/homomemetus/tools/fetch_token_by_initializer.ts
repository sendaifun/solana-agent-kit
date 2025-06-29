import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokenByInitializer
 * @description Filter tokens initialized by a specific address
 * @param       address, string, address of initializer address (required)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_token_by_initializer(
  address: string
): Promise<TokenResponse> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokenByInitializer(address);

    return result;
  } catch (error) {
    throw error;
  }
}
