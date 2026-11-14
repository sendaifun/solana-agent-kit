export interface RugshieldScanOptions {
  chain?: "solana" | "base";
  paymentSignature?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface RugshieldScanResult {
  status: string;
  token_address: string;
  chain: "solana" | "base";
  is_honeypot: boolean | null;
  buy_tax_bps: number | null;
  sell_tax_bps: number | null;
  liquidity_usd: number | null;
  mint_authority_revoked: boolean | null;
  freeze_authority_revoked: boolean | null;
  simulation_status: string | null;
  verdict: string | null;
  risk_factors: string[];
  recommendation: string;
  payment_mode: "x402_header" | "free_preview";
  terminal_unlock_url: string;
  x402_scan_url: string;
}

const DEFAULT_BASE_URL = "https://rugshield-402.onrender.com";

function deriveRecommendation(
  data: any,
  isHoneypot: boolean | null,
  sellTaxBps: number | null,
): string {
  if (
    typeof data.recommendation === "string" &&
    data.recommendation.length > 0
  ) {
    return data.recommendation;
  }
  if (isHoneypot === true) {
    return "DO_NOT_TRADE";
  }
  if (isHoneypot === false && sellTaxBps !== null && sellTaxBps < 1000) {
    return "SAFE_TO_SWAP";
  }
  if (typeof data.verdict === "string" && data.verdict.length > 0) {
    return data.verdict;
  }
  return "INCONCLUSIVE_REQUIRES_SWAP_SIMULATION";
}

/**
 * Fetches token safety metadata from RugShield 402.
 * Uses free /v1/scan/preview by default, or paid x402 /v1/scan when paymentSignature is provided.
 * @async
 * @param {string} mint - The SPL token mint (or Base contract) address.
 * @param {RugshieldScanOptions} options - Optional chain, x402 PAYMENT-SIGNATURE header, or base URL override.
 * @returns {Promise<RugshieldScanResult>} Normalized RugShield token safety report without fabricated zeros.
 */
export async function fetchRugshieldScan(
  mint: string,
  options: RugshieldScanOptions = {},
): Promise<RugshieldScanResult> {
  const baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const chain = options.chain ?? "solana";
  const paymentSignature = options.paymentSignature?.trim();
  const isPaid = Boolean(paymentSignature);
  const endpoint = `${baseUrl}${isPaid ? "/v1/scan" : "/v1/scan/preview"}`;
  const caller = options.fetch ?? fetch;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (paymentSignature) {
    headers["PAYMENT-SIGNATURE"] = paymentSignature;
    headers["X-PAYMENT"] = paymentSignature;
  }

  try {
    const res = await caller(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        token_address: mint,
        chain,
        simulate_sell: isPaid,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      if (res.status === 402) {
        throw new Error(
          `RugShield /v1/scan requires x402 USDC payment (HTTP 402): ${detail}`,
        );
      }
      throw new Error(`RugShield API returned HTTP ${res.status}: ${detail}`);
    }

    const data: any = await res.json();
    const isHoneypot =
      typeof data.is_honeypot === "boolean" ? data.is_honeypot : null;
    const buyTaxBps =
      typeof data.buy_tax_bps === "number" ? data.buy_tax_bps : null;
    const sellTaxBps =
      typeof data.sell_tax_bps === "number" ? data.sell_tax_bps : null;
    const liquidityUsd =
      typeof data.liquidity_usd === "number" ? data.liquidity_usd : null;
    const mintRevoked =
      typeof data.mint_authority_revoked === "boolean"
        ? data.mint_authority_revoked
        : null;
    const freezeRevoked =
      typeof data.freeze_authority_revoked === "boolean"
        ? data.freeze_authority_revoked
        : null;
    const simulationStatus =
      typeof data.simulation_status === "string"
        ? data.simulation_status
        : null;
    const verdict = typeof data.verdict === "string" ? data.verdict : null;
    const riskFactors = Array.isArray(data.risk_factors)
      ? data.risk_factors.filter((item: unknown) => typeof item === "string")
      : [];

    return {
      status: simulationStatus ?? (isPaid ? "unknown" : "preview"),
      token_address: mint,
      chain,
      is_honeypot: isHoneypot,
      buy_tax_bps: buyTaxBps,
      sell_tax_bps: sellTaxBps,
      liquidity_usd: liquidityUsd,
      mint_authority_revoked: mintRevoked,
      freeze_authority_revoked: freezeRevoked,
      simulation_status: simulationStatus,
      verdict,
      risk_factors: riskFactors,
      recommendation: deriveRecommendation(data, isHoneypot, sellTaxBps),
      payment_mode: isPaid ? "x402_header" : "free_preview",
      terminal_unlock_url: `${baseUrl}/?token=${encodeURIComponent(mint)}`,
      x402_scan_url: `${baseUrl}/v1/scan`,
    };
  } catch (error: any) {
    const message = error?.message ?? String(error);
    console.error(`Error fetching RugShield scan for token ${mint}:`, message);
    throw new Error(`Failed to audit token via RugShield: ${message}`);
  }
}
