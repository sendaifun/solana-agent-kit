import { SolanaAgentKit } from "../../agent";

export async function getTrendingTokens(agent: SolanaAgentKit) {
  try {
    const url = agent.config.COINGECKO_PRO_API_KEY
      ? `https://pro-api.coingecko.com/api/v3/search/trending?x_cg_pro_api_key=${agent.config.COINGECKO_PRO_API_KEY}`
      : `https://api.coingecko.com/api/v3/search/trending${agent.config.COINGECKO_DEMO_API_KEY && `?x_cg_demo_api_key=${agent.config.COINGECKO_DEMO_API_KEY}`}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (e) {
    // @ts-expect-error - e is an Error object
    throw new Error(`Couldn't get trending tokens: ${e.message}`);
  }
}
