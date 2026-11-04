import type { SolanaAgentKit } from "solana-agent-kit";

const DEFAULT_BASE_URL = "https://haris-api.vercel.app";

export interface HarisRiskFlag {
  id: string;
  weight: number;
  reason: string;
}

export interface HarisRiskReport {
  mint: string;
  name?: string | null;
  /** 0-100, higher = riskier */
  score: number;
  level: "low" | "medium" | "high" | "critical";
  verdict: string;
  flags: HarisRiskFlag[];
  positives?: string[];
  not_checked?: string[];
  checked_at?: string;
  disclaimer?: string;
  [key: string]: unknown;
}

/**
 * Check a Solana token for scam / rug-pull risk using the Haris Guardian API.
 * Uses the free tier (`GET /v1/check/{mint}`); no API key or signing required.
 * After the free daily quota the API answers HTTP 402 (x402 pay-per-check).
 *
 * @param agent SolanaAgentKit instance (reads optional HARIS_API_BASE_URL from config)
 * @param mint Token mint address
 * @returns Risk report with a 0-100 score (higher = riskier), level and red flags
 */
export async function checkTokenRiskWithHaris(
  agent: SolanaAgentKit,
  mint: string,
): Promise<HarisRiskReport> {
  const config = (agent?.config ?? {}) as Record<string, unknown>;
  const baseUrl = (
    typeof config.HARIS_API_BASE_URL === "string"
      ? config.HARIS_API_BASE_URL
      : DEFAULT_BASE_URL
  ).replace(/\/+$/, "");

  const response = await fetch(
    `${baseUrl}/v1/check/${encodeURIComponent(mint.trim())}`,
    { headers: { accept: "application/json" } },
  );

  if (response.status === 402) {
    throw new Error(
      "Haris Guardian free quota used. Further checks cost $0.01 USDC on Solana via x402 (POST /v1/paid/check).",
    );
  }
  if (!response.ok) {
    throw new Error(`Haris Guardian API error: HTTP ${response.status}`);
  }
  return (await response.json()) as HarisRiskReport;
}
