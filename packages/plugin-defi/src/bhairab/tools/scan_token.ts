import { SolanaAgentKit } from "solana-agent-kit";

const BHAIRAB_ENDPOINT = "https://tao-gateway.fly.dev/v1/risk/scan";

export interface TokenRiskScan {
  verdict: "proceed" | "caution" | "stop";
  confidence: number;
  summary: string;
  reasons: string[];
  signals: {
    found: boolean;
    symbol?: string;
    name?: string;
    priceUsd: number;
    priceChange24hPct: number;
    liquidityUsd: number;
    volume24hUsd: number;
    ageDays: number;
    pairCount: number;
    topDex?: string;
    source: string;
  };
  tier: "free" | "keyed";
  verdictSource: string;
}

/**
 * Scan a token for risk BEFORE trading it, using Bhairab's guardian endpoint.
 *
 * Fetches live market signals (liquidity, 24h move, volume, token age) and
 * returns a verdict — `proceed`, `caution`, or `stop` — with cited reasons.
 * Works with no API key (heuristic verdict, free). Setting `BHAIRAB_API_KEY`
 * in the agent config unlocks an AI-reasoned verdict.
 *
 * @param agent      SolanaAgentKit instance
 * @param token      The token mint address to scan
 * @param action     The intended action: buy | sell | swap | transfer (default "buy")
 * @param amountUsd  Optional intended amount in USD, for context
 * @returns          The risk verdict, reasons, and live signals
 */
export async function scanToken(
  agent: SolanaAgentKit,
  token: string,
  action = "buy",
  amountUsd?: number,
): Promise<TokenRiskScan> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const apiKey = agent.config.BHAIRAB_API_KEY;
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const res = await fetch(BHAIRAB_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ chain: "solana", token, action, amountUsd }),
  });

  if (!res.ok) {
    throw new Error(
      `Bhairab risk scan failed (${res.status}): ${await res.text()}`,
    );
  }

  return (await res.json()) as TokenRiskScan;
}
