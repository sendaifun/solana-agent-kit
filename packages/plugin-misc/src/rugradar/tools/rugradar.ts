import type { SolanaAgentKit } from "solana-agent-kit";
import { RUGRADAR_API_URL } from "../constants";

async function rugradarGet(agent: SolanaAgentKit, path: string) {
  const apiKey = agent.config?.OTHER_API_KEYS?.RUGRADAR_API_KEY;
  const response = await fetch(`${RUGRADAR_API_URL}${path}`, {
    headers: {
      accept: "application/json",
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 402) {
    throw new Error(
      `RugRadar free daily limit reached. Set OTHER_API_KEYS.RUGRADAR_API_KEY or see ${RUGRADAR_API_URL}/agents`,
    );
  }
  if (!response.ok || body.ok === false) {
    throw new Error(body.error || `RugRadar HTTP ${response.status}`);
  }
  return body;
}

/**
 * Read-only rug and scam risk check for a Solana token via RugRadar.
 * @param agent SolanaAgentKit instance
 * @param query Mint address, pump fun / DexScreener link, or $TICKER
 * @returns 0-100 risk score, red flags, facts and a report URL
 */
export async function rugradarCheckToken(agent: SolanaAgentKit, query: string) {
  return rugradarGet(agent, `/api/check?q=${encodeURIComponent(query)}`);
}

/**
 * Riskiest SPL tokens held by a public Solana wallet (free tier: 3 riskiest).
 * @param agent SolanaAgentKit instance
 * @param address Public wallet address
 */
export async function rugradarScanWallet(
  agent: SolanaAgentKit,
  address: string,
) {
  return rugradarGet(
    agent,
    `/api/wallet?address=${encodeURIComponent(address)}`,
  );
}

/**
 * Wallet-drainer / phishing scan of a URL or post text.
 * @param agent SolanaAgentKit instance
 * @param text URL or pasted post text
 */
export async function rugradarScanLink(agent: SolanaAgentKit, text: string) {
  return rugradarGet(
    agent,
    `/api/scan-link?text=${encodeURIComponent(text.slice(0, 2000))}`,
  );
}
