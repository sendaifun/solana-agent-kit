import BN from "bn.js";
import { PythPriceFeedIDItem } from "../../types";

/**
 * Fetch the price feed ID for a given token symbol from Pyth
 * @param tokenSymbol Token symbol
 * @returns Price feed ID
 */
export async function fetchPythPriceFeedID(
  tokenSymbol: string,
): Promise<string> {
  try {
    const stableHermesServiceUrl: string = "https://hermes.pyth.network";

    const response = await fetch(
      `${stableHermesServiceUrl}/v2/price_feeds?query=${tokenSymbol}&asset_type=crypto`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error(`No price feed found for ${tokenSymbol}`);
    }

    if (data.length > 1) {
      const filteredData = data.filter(
        (item: PythPriceFeedIDItem) =>
          item.attributes.base.toLowerCase() === tokenSymbol.toLowerCase(),
      );

      if (filteredData.length === 0) {
        throw new Error(`No price feed found for ${tokenSymbol}`);
      }

      return filteredData[0].id;
    }

    return data[0].id;
  } catch (error: any) {
    throw new Error(
      `Fetching price feed ID from Pyth failed: ${error.message}`,
    );
  }
}

/**
 * Fetch the price of a given price feed from Pyth
 * @param priceFeedID Price feed ID
 * @returns Latest price value from feed
 *
 * You can find priceFeedIDs here: https://www.pyth.network/developers/price-feed-ids#stable
 */
export async function fetchPythPrice(feedID: string): Promise<string> {
  try {
    const stableHermesServiceUrl: string = "https://hermes.pyth.network";

    const response = await fetch(
      `${stableHermesServiceUrl}/v2/updates/price/latest?ids[]=${feedID}`,
    );

    const data = await response.json();

    const parsedData = data.parsed;

    if (parsedData.length === 0) {
      throw new Error(`No price data found for ${feedID}`);
    }

    const price = new BN(parsedData[0].price.price);
    const exponent = parsedData[0].price.expo;

    if (exponent < 0) {
      const adjustedPrice = price.mul(new BN(100));
      const divisor = new BN(10).pow(new BN(-exponent));
      const scaledPrice = adjustedPrice.div(divisor);

      const priceStr = scaledPrice.toString();
      const formattedPrice = `${priceStr.slice(0, -2)}.${priceStr.slice(-2)}`;
      return formattedPrice.startsWith(".")
        ? `0${formattedPrice}`
        : formattedPrice;
    }

    const scaledPrice = price.div(new BN(10).pow(new BN(exponent)));
    return scaledPrice.toString();
  } catch (error: any) {
    throw new Error(`Fetching price from Pyth failed: ${error.message}`);
  }
}
