import { SolanaAgentKit } from "../../agent";

export async function getTrendingPools(
  agent: SolanaAgentKit,
  duration: "5m" | "1h" | "24h" | "6h" = "24h",
) {
  try {
    if (!agent.config.COINGECKO_PRO_API_KEY) {
      throw new Error("No CoinGecko Pro API key provided");
    }

    const url = `https://pro-api.coingecko.com/api/v3/onchain/networks/solana/trending_pools?include=base_token,network&duration=${duration}&x_cg_pro_api_key=${agent.config.COINGECKO_PRO_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (e) {
    throw new Error(
      // @ts-expect-error - error is an object
      `Error fetching trending pools from CoinGecko: ${e.message}`,
    );
  }
}
