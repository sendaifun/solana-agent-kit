import type { SolanaAgentKit } from "solana-agent-kit";

const BASE_URL = "https://api.dexra.dev";

export type DexraVerdict = "ok" | "caution" | "avoid" | "unknown";

/** Every Dexra check answers with a verdict and the reasons behind it, worst first. */
export interface DexraCheck {
  verdict: DexraVerdict;
  reasons: string[];
  summary: string;
  generated_at: number;
  [field: string]: unknown;
}

export interface DexraLaunch {
  mint: string;
  pool: string;
  platform: string;
  age_secs: number;
  verdict: DexraVerdict;
  reasons: string[];
  [field: string]: unknown;
}

export interface DexraLaunchCheck {
  generated_at: number;
  results: { mint: string; found: boolean; launches: DexraLaunch[] }[];
}

async function dexraRequest<T>(
  agent: SolanaAgentKit,
  method: "GET" | "POST",
  path: string,
  options: {
    params?: Record<string, string | number | undefined>;
    body?: unknown;
  } = {},
): Promise<T> {
  const url = new URL(BASE_URL + path);
  for (const [name, value] of Object.entries(options.params ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(name, String(value));
    }
  }
  const headers: Record<string, string> = {
    accept: "application/json",
    "x-dexra-client": "solana-agent-kit",
  };
  if (agent.config?.DEXRA_API_KEY) {
    headers.authorization = `Bearer ${agent.config.DEXRA_API_KEY}`;
  }
  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 402) {
      const why = response.headers.get("x-dexra-subscription");
      throw new Error(
        why
          ? `Dexra: this call is not covered by the account (${why})`
          : "Dexra: payment required; set DEXRA_API_KEY (free key at https://dexra.dev/app/keys)",
      );
    }
    throw new Error(
      `Dexra: ${json.context ?? json.error ?? `HTTP ${response.status}`}`,
    );
  }
  return json.result as T;
}

/**
 * Checks fresh launches (pump.fun, LetsBonk, PumpSwap, Raydium, Meteora) by mint:
 * mint and freeze authority, liquidity and its lock, the creator's earlier launches
 * and how many collapsed, and who funded the first buyers.
 * @param agent SolanaAgentKit instance
 * @param mints Token mints, up to 5 per call on a free key
 * @returns One result per mint, each launch with a verdict and reasons
 */
export async function dexraLaunchCheck(
  agent: SolanaAgentKit,
  mints: string[],
): Promise<DexraLaunchCheck> {
  return dexraRequest(agent, "POST", "/new_launches/batch", {
    body: { mints },
  });
}

/**
 * Checks who really holds a token: top holders funded from the same address, real
 * concentration after merging linked wallets, holder and liquidity history, blacklist
 * proximity, authorities and Token-2022 extensions.
 * @param agent SolanaAgentKit instance
 * @param mint Token mint
 * @returns Verdict, reasons and the evidence
 */
export async function dexraTokenDeepCheck(
  agent: SolanaAgentKit,
  mint: string,
): Promise<DexraCheck> {
  return dexraRequest(agent, "GET", "/token_deep_check", { params: { mint } });
}

/**
 * Checks a swap before sending it: price impact on the best route, sandwich share on
 * the pool, Token-2022 transfer fees, hooks and permanent delegate, authorities.
 * @param agent SolanaAgentKit instance
 * @param mint Token to buy or sell
 * @param side "buy" or "sell"
 * @param amount Quote units for a buy (SOL by default), token units for a sell
 * @param quote Quote mint, SOL by default
 * @returns Verdict, reasons and the assessment
 */
export async function dexraSwapPreflight(
  agent: SolanaAgentKit,
  mint: string,
  side: "buy" | "sell",
  amount: number,
  quote?: string,
): Promise<DexraCheck> {
  return dexraRequest(agent, "GET", "/swap_preflight", {
    params: { mint, side, amount, quote },
  });
}
