const BASE_URL = "https://mosn-api.mosn-3r41y.workers.dev";

/** Verdict returned by the MOSN token safety check. */
export interface MosnTokenCheck {
  mint: string;
  checkedAt: string;
  verdict: "SAFE" | "CAUTION" | "DANGER";
  reasons: string[];
  authorities?: {
    mintAuthorityActive: boolean;
    freezeAuthorityActive: boolean;
    dangerousExtensions: string[];
    transferFeeBps?: number;
  };
  holders?: {
    topWalletPct: number;
    top10WalletsPct: number;
    note?: string;
  } | null;
  market?: Record<string, unknown> | null;
  exit?: {
    sellRouteExists: boolean | null;
    roundTripLossPct: number | null;
  };
  disclaimer?: string;
}

/**
 * Checks a Solana token for rug-pull mechanics using MOSN: mint & freeze authority,
 * dangerous Token-2022 extensions, real-wallet holder concentration (pools excluded),
 * liquidity, and a live sell-route (honeypot) test.
 * The first 5 checks per day per caller are free (no API key). Beyond that the endpoint
 * answers HTTP 402 with x402 payment details (USDC on Solana or Base).
 * @async
 * @param {string} mint - The mint address of the token.
 * @returns {Promise<MosnTokenCheck>} SAFE / CAUTION / DANGER verdict with reasons.
 * @throws {Error} If the API call fails or the free daily limit is used up.
 */
export async function fetchMosnTokenCheck(
  mint: string,
): Promise<MosnTokenCheck> {
  const response = await fetch(
    `${BASE_URL}/token-check?mint=${encodeURIComponent(mint)}`,
  );
  if (response.status === 402) {
    throw new Error(
      `MOSN free daily checks used up. Pay-per-call (x402, USDC) at ${BASE_URL}/token-check?mint=${mint}`,
    );
  }
  if (!response.ok) {
    throw new Error(`MOSN token check failed: HTTP ${response.status}`);
  }
  return (await response.json()) as MosnTokenCheck;
}
