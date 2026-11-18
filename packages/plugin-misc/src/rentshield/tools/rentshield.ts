import type { SolanaAgentKit } from "solana-agent-kit";
import {
  BASE58_ALPHABET,
  RENTSHIELD_DEFAULT_URL,
  SOLANA_PUBKEY_REGEX,
} from "../constants";

let cachedLiveBase: { url: string | null; expiresAt: number } = {
  url: null,
  expiresAt: 0,
};

export function resetRentShieldCache(): void {
  cachedLiveBase = { url: null, expiresAt: 0 };
}

export function isValidSolanaPublicKey(input: string): boolean {
  const trimmed = input.trim();
  if (!SOLANA_PUBKEY_REGEX.test(trimmed)) {
    return false;
  }
  const bytes: number[] = [0];
  for (let i = 0; i < trimmed.length; i += 1) {
    let carry = BASE58_ALPHABET.indexOf(trimmed[i]);
    if (carry < 0) {
      return false;
    }
    for (let j = 0; j < bytes.length; j += 1) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  let leadingOnes = 0;
  while (leadingOnes < trimmed.length && trimmed[leadingOnes] === "1") {
    leadingOnes += 1;
  }
  return bytes.length + leadingOnes === 32;
}

function assertPublicAddress(value: string, label: string): string {
  const trimmed = String(value || "").trim();
  if (!isValidSolanaPublicKey(trimmed)) {
    throw new Error(
      `Invalid ${label}: expected a 32-byte base58 Solana public key. Never pass private keys or seed phrases.`,
    );
  }
  return trimmed;
}

async function resolveLiveApiBase(): Promise<string | null> {
  const now = Date.now();
  if (cachedLiveBase.url && cachedLiveBase.expiresAt > now) {
    return cachedLiveBase.url;
  }
  const response = await fetch(`${RENTSHIELD_DEFAULT_URL}/live_endpoint.json`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    return null;
  }
  const body = (await response.json().catch(() => ({}))) as Record<string, any>;
  const candidate = String(body.api_base || body.endpoint || "")
    .trim()
    .replace(/\/+$/, "");
  if (!candidate) {
    return null;
  }
  const parsed = new URL(candidate);
  if (parsed.protocol !== "https:") {
    return null;
  }
  cachedLiveBase = { url: candidate, expiresAt: now + 5 * 60 * 1000 };
  return candidate;
}

async function requestRentShield(
  agent: SolanaAgentKit,
  path: string,
  init: RequestInit,
): Promise<Record<string, any>> {
  const apiKey = agent.config?.OTHER_API_KEYS?.RENTSHIELD_API_KEY;
  const customBase = String(
    agent.config?.OTHER_API_KEYS?.RENTSHIELD_API_URL || "",
  )
    .trim()
    .replace(/\/+$/, "");
  const initialBase =
    customBase ||
    (cachedLiveBase.url && cachedLiveBase.expiresAt > Date.now()
      ? cachedLiveBase.url
      : RENTSHIELD_DEFAULT_URL);

  const headers: Record<string, string> = {
    accept: "application/json",
    ...((init.headers as Record<string, string>) || {}),
    ...(apiKey ? { "x-api-key": apiKey } : {}),
  };

  let response = await fetch(`${initialBase}${path}`, {
    ...init,
    headers,
  });

  if (!customBase && (response.status === 404 || response.status === 405)) {
    const liveBase = await resolveLiveApiBase();
    if (liveBase && liveBase !== initialBase) {
      response = await fetch(`${liveBase}${path}`, {
        ...init,
        headers,
      });
    }
  }

  const body = (await response.json().catch(() => ({}))) as Record<string, any>;
  if (response.status === 402) {
    throw new Error(
      `Rent & Rug Shield free daily quota reached. Configure OTHER_API_KEYS.RENTSHIELD_API_KEY or visit ${RENTSHIELD_DEFAULT_URL}`,
    );
  }
  if (!response.ok || body.ok === false) {
    throw new Error(body.error || `Rent & Rug Shield HTTP ${response.status}`);
  }
  return body;
}

/**
 * Read-only 11-layer pre-buy rug and scam audit for a Solana token mint.
 * @param agent SolanaAgentKit instance
 * @param mint Public base58 Solana token mint address
 */
export async function rentshieldCheckToken(
  agent: SolanaAgentKit,
  mint: string,
) {
  const cleanMint = assertPublicAddress(mint, "mint address");
  const body = await requestRentShield(
    agent,
    `/api/v1/shield-check?mint=${encodeURIComponent(cleanMint)}`,
    {
      method: "GET",
      headers: { "x-payment-protocol": "x402" },
    },
  );
  const score =
    typeof body.score === "number" ? body.score : Number(body.safety_score);
  const normalizedScore = Number.isFinite(score) ? score : null;
  return {
    mint: body.mint || cleanMint,
    symbol: body.symbol || null,
    name: body.name || null,
    tokenProgram: body.token_program || null,
    score: normalizedScore,
    safeToBuy: Boolean(
      body.safe_to_buy ??
        (normalizedScore !== null &&
          normalizedScore >= 75 &&
          !body.hidden_pda_rent_trap),
    ),
    verdict: body.verdict || null,
    layersChecked: body.layers_checked ?? 11,
    layersPassed: body.layers_passed ?? null,
    checklistSummary: body.checklist_summary || null,
    checks: Array.isArray(body.checks) ? body.checks : [],
    reportUrl: `${RENTSHIELD_DEFAULT_URL}/audit/${cleanMint}`,
  };
}

/**
 * Read-only, non-custodial scan for reclaimable SOL rent in empty SPL & Token-2022 ATAs (0% first-claim fee).
 * @param agent SolanaAgentKit instance
 * @param wallet Optional public base58 Solana wallet address (defaults to agent.wallet.publicKey)
 */
export async function rentshieldScanWallet(
  agent: SolanaAgentKit,
  wallet?: string,
) {
  const fallbackWallet = agent.wallet?.publicKey
    ? agent.wallet.publicKey.toBase58()
    : "";
  const cleanWallet = assertPublicAddress(
    wallet || fallbackWallet,
    "wallet address",
  );
  const body = await requestRentShield(agent, "/api/scan-wallet", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wallet: cleanWallet, user_initiated: false }),
  });
  return {
    wallet: body.wallet || cleanWallet,
    isFirstFreeClaim: Boolean(body.is_first_free_claim),
    effectiveFeeBps: body.effective_fee_bps ?? body.fee_bps ?? 0,
    reclaimableCount: body.reclaimable_count ?? 0,
    emptyCount: body.empty_count ?? 0,
    dustCount: body.dust_count ?? 0,
    activeCount: body.active_count ?? 0,
    totalReclaimableSol: body.total_reclaimable_sol ?? 0,
    totalReclaimableLamports: body.total_reclaimable_lamports ?? 0,
    emptyReclaimable: Array.isArray(body.empty_reclaimable)
      ? body.empty_reclaimable
      : [],
    claimUrl: `${RENTSHIELD_DEFAULT_URL}/?wallet=${cleanWallet}`,
  };
}
