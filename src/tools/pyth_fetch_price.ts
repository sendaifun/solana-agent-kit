import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import BN from "bn.js";

/**
 * Fetch the price of a given price feed from Pyth
 * @param agent SolanaAgentKit instance
 * @param priceFeedID Price feed ID
 * @returns Latest price value from feed
 *
 * You can find priceFeedIDs here: https://www.pyth.network/developers/price-feed-ids#stable
 */
export async function pythFetchPrice(priceFeedID: string): Promise<string> {
  // get Hermes service URL from https://docs.pyth.network/price-feeds/api-instances-and-providers/hermes
  const stableHermesServiceUrl: string = "https://hermes.pyth.network";
  const connection = new PriceServiceConnection(stableHermesServiceUrl);
  const feeds = [priceFeedID];

  try {
    const currentPrice = await connection.getLatestPriceFeeds(feeds);

    if (currentPrice === undefined) {
      throw new Error("Price data not available for the given token.");
    }

    if (currentPrice.length === 0) {
      throw new Error("Price data not available for the given token.");
    }

    // get price and exponent from price feed
    let price = new BN(currentPrice[0].getPriceUnchecked().price);
    let exponent = new BN(currentPrice[0].getPriceUnchecked().expo);

    // convert to scaled price
    let scaledPrice = price.div(new BN(10).pow(exponent));

    return scaledPrice.toString();
  } catch (error: any) {
    throw new Error(`Fetching price from Pyth failed: ${error.message}`);
  }
}
