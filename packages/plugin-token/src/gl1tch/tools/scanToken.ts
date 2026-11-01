export interface Gl1tchScanReport {
  mint: string;
  chain: string;
  name?: string;
  symbol?: string;
  score: number;
  verdict: "CLEAN" | "CAUTION" | "HIGH RISK" | "RUG-SHAPED";
  aiVerdict?: string;
  confidence?: number;
  checks?: {
    mintAuthorityRevoked?: boolean;
    freezeAuthorityRevoked?: boolean;
    lpLocked?: boolean;
    lpLockPercentage?: number;
    topHoldersShare?: number;
    isHoneypot?: boolean;
    buyTax?: number;
    sellTax?: number;
    [key: string]: any;
  };
  meta?: {
    deployer?: string;
    deployerReputation?: any;
    [key: string]: any;
  };
  scannedAt?: number;
  [key: string]: any;
}

const GL1TCH_API_BASE = "https://gl1tchbased.xyz";

/**
 * Scans a Solana token using GL1TCH's multi-vector risk engine.
 * Inspects mint/freeze authority, LP lock status, honeypot tax, insider graph,
 * and deployer reputation.
 *
 * @async
 * @param {string} mint - The Solana token mint address.
 * @returns {Promise<Gl1tchScanReport>} Full token safety report with score and plain-language verdict.
 * @throws {Error} If the API call fails or returns an error.
 */
export async function gl1tchTokenScan(mint: string): Promise<Gl1tchScanReport> {
  try {
    const url = `${GL1TCH_API_BASE}/api/scan?mint=${encodeURIComponent(mint)}&chain=solana`;
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "solana-agent-kit/gl1tch-plugin",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    return data as Gl1tchScanReport;
  } catch (error: any) {
    console.error(`Error scanning token ${mint} with GL1TCH:`, error.message);
    throw new Error(
      `Failed to scan token ${mint} with GL1TCH: ${error.message}`,
    );
  }
}
