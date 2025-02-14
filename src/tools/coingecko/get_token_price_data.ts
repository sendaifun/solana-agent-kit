import { SolanaAgentKit } from "../../agent";

export async function getTokenPriceData(
  agent: SolanaAgentKit,
  tokenAddresses: string[],
) {
  try {
    const url = agent.config.COINGECKO_PRO_API_KEY
      ? `https://pro-api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${tokenAddresses.join(",")}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&x_cg_pro_api_key=${agent.config.COINGECKO_PRO_API_KEY}`
      : `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${tokenAddresses.join(",")}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true${agent.config.COINGECKO_DEMO_API_KEY && `&x_cg_demo_api_key=${agent.config.COINGECKO_DEMO_API_KEY}`}`;

    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (e) {
    throw new Error(
      // @ts-expect-error - error is an object
      `Error fetching token price data from CoinGecko: ${e.message}`,
    );
  }
}
