import { SolanaAgentKit } from "../../agent";

export async function getTopGainers(
  agent: SolanaAgentKit,
  duration: "1h" | "24h" | "7d" | "14d" | "30d" | "60d" | "1y" = "24h",
  topCoins: 300 | 500 | 1000 | "all" = "all",
) {
  try {
    if (!agent.config.COINGECKO_PRO_API_KEY) {
      throw new Error("No CoinGecko Pro API key provided");
    }

    const url = `https://pro-api.coingecko.com/api/v3/coins/top_gainers_losers?vs_currency=usd&duration=${duration}&top_coins=${topCoins}&x_cg_pro_api_key=${agent.config.COINGECKO_PRO_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (e) {
    throw new Error(
      // @ts-expect-error - error is an object
      `Error fetching top gainers from CoinGecko: ${e.message}`,
    );
  }
}
