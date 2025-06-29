import { MemetusPumpfun, TokenResponse } from "@0xobedient/memetus-pumpfun-sdk";

/**
 * @name        fetchTokenBySignature
 * @description Filter by a specific transaction signature
 * @param       signarue, string, signature that token creation transaction included(required)
 * @link        https://www.npmjs.com/package/@0xobedient/memetus-pumpfun-sdk
 */
export async function fetch_token_by_signature(
  signature: string
): Promise<TokenResponse> {
  try {
    const client = new MemetusPumpfun();
    const result = await client.fetchTokenBySignature(signature);

    return result;
  } catch (error) {
    throw error;
  }
}
