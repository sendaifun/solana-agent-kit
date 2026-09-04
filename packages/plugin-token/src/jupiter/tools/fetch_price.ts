import type { PublicKey } from "@solana/web3.js";
import { JUP_PRICE_API } from "./utils/constants";

/**
 * Fetch the price of a given token quoted in USDC using Jupiter API
 * @param tokenId The token mint address
 * @returns The price of the token quoted in USDC
 */
export async function fetchPrice(tokenId: PublicKey): Promise<string> {
  try {
    const mint = tokenId.toBase58();
    const response = await fetch(`${JUP_PRICE_API}?ids=${mint}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();

    // Price API v3 keys results by mint and renamed `price` to `usdPrice`.
    const price = data[mint]?.usdPrice;

    if (!price) {
      throw new Error("Price data not available for the given token.");
    }

    return price.toString();
  } catch (error: any) {
    throw new Error(`Price fetch failed: ${error.message}`);
  }
}
