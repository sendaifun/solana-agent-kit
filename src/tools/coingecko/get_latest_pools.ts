import { SolanaAgentKit } from "../../agent";

export async function getLatestPools(agent: SolanaAgentKit) {
  try {
    if (!agent.config.COINGECKO_PRO_API_KEY) {
      throw new Error("No CoinGecko Pro API key provided");
    }

    const url = `https://pro-api.coingecko.com/api/v3/onchain/networks/solana/new_pools?include=base_token,network&x_cg_pro_api_key=${agent.config.COINGECKO_PRO_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (e) {
    throw new Error(
      // @ts-expect-error - error is an object
      `Error fetching latest pools from CoinGecko: ${e.message}`,
    );
  }
}
