import { IntmoltReport, IntmoltDetailedReport } from "../../types";

const BASE_URL = "https://intmolt.org";

/**
 * Fetches a token security report from integrity.molt.
 *
 * integrity.molt queries Solana mainnet directly — no pre-indexed database
 * required. Works for any valid mint address including brand-new tokens.
 *
 * Supports two auth modes:
 *   - API key (Bearer im_xxx): requires active Builder/Team subscription
 *   - x402 micropayment: pass a signed Solana transaction in X-Payment header
 *   - No auth: community rate-limited free tier (3 scans/hour)
 *
 * @param mint - Solana token mint address (base58)
 * @param apiKey - Optional integrity.molt API key (im_ prefix)
 * @returns Token security report with risk level, flags, and AI assessment
 */
export async function fetchIntmoltTokenReport(
  mint: string,
  apiKey?: string,
): Promise<IntmoltReport> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${BASE_URL}/scan/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({ address: mint }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error(
          `Payment required. Set INTMOLT_API_KEY or use x402 payment. See https://intmolt.org/docs.html`,
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(
      `Error fetching integrity.molt report for token ${mint}:`,
      error.message,
    );
    throw new Error(
      `Failed to fetch integrity.molt report for token ${mint}: ${error.message}`,
    );
  }
}

/**
 * Fetches a deep multi-agent security audit from integrity.molt.
 *
 * Runs a full swarm pipeline: scanner-agent → analyst-agent →
 * reputation-agent → meta-scorecard. Returns an Ed25519-signed report
 * that can be independently verified at https://intmolt.org/verify.html
 *
 * @param mint - Solana token mint address (base58)
 * @param apiKey - integrity.molt API key (required for deep audit)
 * @returns Detailed audit report with agent outputs, aggregate score, and signed envelope
 */
export async function fetchIntmoltDeepAudit(
  mint: string,
  apiKey?: string,
): Promise<IntmoltDetailedReport> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${BASE_URL}/scan/deep`, {
      method: "POST",
      headers,
      body: JSON.stringify({ address: mint }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error(
          `Payment required (2.00 USDC). Set INTMOLT_API_KEY with Builder/Team subscription.`,
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(
      `Error fetching integrity.molt deep audit for token ${mint}:`,
      error.message,
    );
    throw new Error(
      `Failed to fetch integrity.molt deep audit for token ${mint}: ${error.message}`,
    );
  }
}
