import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokenByMint
 * @description Filter by a specific token address
 * @param       address, string, address of token mint(required)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_token_by_mint(
  address: string
): Promise<TokenResponse> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokenByAddress(address);

    return result;
  } catch (error) {
    throw error;
  }
}
