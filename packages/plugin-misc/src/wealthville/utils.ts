import { SolanaAgentKit } from "solana-agent-kit";

export const WEALTHVILLE_DISCLAIMER =
  "Wealthville data product, not financial advice. Methodology: https://www.wealthville.net/learn/wealthville-score";

/**
 * GET a Wealthville public API path. No key is required (anonymous tier is
 * 60 req/min per IP); an optional free partner key raises the limit and is
 * read from agent.config.OTHER_API_KEYS.WEALTHVILLE_API_KEY.
 */
export async function wealthvilleGet(
  agent: SolanaAgentKit,
  path: string,
): Promise<any> {
  const headers: Record<string, string> = { accept: "application/json" };
  const apiKey = agent.config?.OTHER_API_KEYS?.WEALTHVILLE_API_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  const response = await fetch(`https://wealthville.net${path}`, { headers });
  if (!response.ok) {
    throw new Error(`Wealthville API returned ${response.status} for ${path}`);
  }
  return response.json();
}
