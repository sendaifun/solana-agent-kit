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
    const price = new BN(currentPrice[0].getPriceUnchecked().price);
    const exponent = new BN(currentPrice[0].getPriceUnchecked().expo);

    // convert to scaled price
    const scaledPrice = price.div(new BN(10).pow(exponent));

    return scaledPrice.toString();
  } catch (error: any) {
    throw new Error(`Fetching price from Pyth failed: ${error.message}`);
  }
}

export async function fetchPythPriceFeedID(tokenSymbol: string): Promise<string> {
  try {

    const stableHermesServiceUrl: string = "https://hermes.pyth.network";
    
    const response = await fetch(`${stableHermesServiceUrl}/v2/price_feeds/?query=${tokenSymbol}&asset_type=crypto`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error(`No price feed found for ${tokenSymbol}`);
    }
    
    if (data.length > 1) {
      const filteredData = data.filter((item: any) => item.attributes.base.toLowerCase() === tokenSymbol.toLowerCase());
      
      if (filteredData.length === 0) {
        throw new Error(`No price feed found for ${tokenSymbol}`);
      }
      
      return filteredData[0].id;
    }
    
    return data[0].id;
  } catch (error: any) {
    throw new Error(`Fetching price feed ID from Pyth failed: ${error.message}`);
  }
}

export async function fetchPythPrice(feedID: string) {
  const stableHermesServiceUrl: string = "https://hermes.pyth.network";

  const response = await fetch(`${stableHermesServiceUrl}/v2/updates/price/latest/?ids[]=${feedID}`);

  const data = await response.json();

  const parsedData = data.parsed;

  return parsedData;
}
