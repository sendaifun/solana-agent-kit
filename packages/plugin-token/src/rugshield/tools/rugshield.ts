export interface RugshieldScanResult {
  status: string;
  token_address: string;
  is_honeypot: boolean;
  buy_tax_bps?: number;
  sell_tax_bps?: number;
  liquidity_usd?: number;
  sybil_clusters?: number;
  recommendation: string;
  terminal_unlock_url: string;
  blink_url: string;
}

const BASE_URL = "https://rugshield-402.onrender.com";

/**
 * Fetches pre-trade safety and honeypot simulation report from RugShield 402.
 * @async
 * @param {string} mint - The SPL token mint address.
 * @returns {Promise<RugshieldScanResult>} The RugShield token safety report.
 */
export async function fetchRugshieldScan(mint: string): Promise<RugshieldScanResult> {
  try {
    const res = await fetch(`${BASE_URL}/v1/scan/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token_address: mint, chain: "solana", simulate_sell: true })
    });

    if (!res.ok) {
      throw new Error(`RugShield API returned HTTP ${res.status}`);
    }

    const data: any = await res.json();
    return {
      status: "success",
      token_address: mint,
      is_honeypot: Boolean(data.is_honeypot),
      buy_tax_bps: data.buy_tax_bps ?? 0,
      sell_tax_bps: data.sell_tax_bps ?? 0,
      liquidity_usd: data.liquidity_usd ?? 0,
      sybil_clusters: data.sybil_clusters ?? 0,
      recommendation: data.recommendation || (data.is_honeypot ? "DO_NOT_TRADE" : "SAFE_TO_SWAP"),
      terminal_unlock_url: `${BASE_URL}/?token=${mint}`,
      blink_url: `https://dial.to/?action=solana-action:${encodeURIComponent(BASE_URL + "/api/actions/scan?token=" + mint)}`
    };
  } catch (error: any) {
    console.error(`Error fetching RugShield scan for token ${mint}:`, error.message);
    throw new Error(`Failed to audit token via RugShield: ${error.message}`);
  }
}
