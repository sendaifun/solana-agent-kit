import type { SolanaAgentKit } from "solana-agent-kit";

const DEFAULT_NULLCLEAR_BASE_URL = "https://api.nullclear.dev";

export type NullClearRecommendedAction =
  | "EXECUTE_SAFE"
  | "CAUTION_HIGH_RISK"
  | "ABORT_CRITICAL_TRAP"
  | "ABORT_DRAINER_APPROVAL"
  | "ABORT_WILL_REVERT";

export interface NullClearSolanaScanReport {
  chain: string;
  address: string;
  name?: string | null;
  symbol?: string | null;
  isSafe: boolean;
  riskScore: number;
  safetyVerdict: "SAFE" | "CAUTION" | "CRITICAL_TRAP" | string;
  recommendedAgentAction: NullClearRecommendedAction;
  liquidityUsd?: number | null;
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  isToken2022?: boolean;
  hasTransferHook?: boolean;
  hasPermanentDelegate?: boolean;
  riskFlags: string[];
  summary?: string;
  [key: string]: unknown;
}

export interface NullClearSolanaGuardOptions {
  /** Target SPL / Token-2022 mint address being swapped or transferred */
  tokenAddress?: string;
  /** Optional base64-encoded serialized Solana transaction to decode and simulate */
  rawTransactionBase64?: string;
  /** Optional custom Solana RPC endpoint for state simulation */
  rpcUrl?: string;
}

export interface NullClearSolanaGuardReport {
  chain: "solana";
  isSafe: boolean;
  riskScore: number;
  safetyVerdict: string;
  recommendedAgentAction: NullClearRecommendedAction;
  summary: string;
  riskFlags: string[];
  decoded?: Record<string, unknown> | null;
  simulation?: Record<string, unknown> | null;
  tokenAudits?: NullClearSolanaScanReport[];
  [key: string]: unknown;
}

function resolveNullClearConfig(agent: SolanaAgentKit): {
  baseUrl: string;
  headers: Record<string, string>;
} {
  const config = (agent?.config ?? {}) as Record<string, unknown>;
  const baseUrl = (
    typeof config.NULLCLEAR_API_BASE_URL === "string" &&
    config.NULLCLEAR_API_BASE_URL.trim().length > 0
      ? config.NULLCLEAR_API_BASE_URL
      : DEFAULT_NULLCLEAR_BASE_URL
  ).replace(/\/+$/, "");

  const apiKey =
    typeof config.NULLCLEAR_API_KEY === "string" &&
    config.NULLCLEAR_API_KEY.trim().length > 0
      ? config.NULLCLEAR_API_KEY.trim()
      : undefined;

  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/json",
  };

  if (apiKey) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return { baseUrl, headers };
}

/**
 * Audit a Solana SPL or Token-2022 mint address for rug-pull and drainer traps
 * (active Mint/Freeze authority, Token-2022 TransferHook, PermanentDelegate,
 * low liquidity, and honeypot flags) using the NullClear Pre-Execution Firewall.
 *
 * Works out of the box on the zero-key free tier (`GET /v1/scan/solana/:mint`),
 * or at sub-5ms edge latency with an optional `NULLCLEAR_API_KEY` (`nc_live_...`)
 * in `agent.config`.
 *
 * @param agent SolanaAgentKit instance
 * @param mint Solana token mint address (Base58)
 * @returns Structured forensic report with `recommendedAgentAction`
 */
export async function scanSolanaTokenWithNullClear(
  agent: SolanaAgentKit,
  mint: string,
): Promise<NullClearSolanaScanReport> {
  const trimmedMint = mint.trim();
  if (!trimmedMint) {
    throw new Error("Solana token mint address is required.");
  }

  const { baseUrl, headers } = resolveNullClearConfig(agent);
  const response = await fetch(
    `${baseUrl}/v1/scan/solana/${encodeURIComponent(trimmedMint)}`,
    {
      method: "GET",
      headers,
    },
  );

  if (response.status === 402) {
    throw new Error(
      "NullClear free daily quota reached. Configure NULLCLEAR_API_KEY (nc_live_...) in agent.config or use x402 micro-settlement ($0.005 USDC).",
    );
  }

  if (!response.ok) {
    throw new Error(`NullClear scan API error: HTTP ${response.status}`);
  }

  return (await response.json()) as NullClearSolanaScanReport;
}

/**
 * Run a 1-call pre-sign security firewall check on a Solana transaction or token mint
 * (`POST /v1/guard` with `chain: "solana"`). Decodes serialized wire instructions,
 * executes `simulateTransaction` preflight, and audits all touched SPL / Token-2022
 * mints for transfer hooks, permanent delegates, and freeze/mint authorities.
 *
 * @param agent SolanaAgentKit instance
 * @param options Token mint address and/or base64-encoded Solana wire transaction
 * @returns Combined pre-execution guard verdict and simulation result
 */
export async function guardSolanaTxWithNullClear(
  agent: SolanaAgentKit,
  options: NullClearSolanaGuardOptions,
): Promise<NullClearSolanaGuardReport> {
  if (!options.tokenAddress && !options.rawTransactionBase64) {
    throw new Error(
      "At least one of tokenAddress or rawTransactionBase64 must be provided to guardSolanaTxWithNullClear.",
    );
  }

  const { baseUrl, headers } = resolveNullClearConfig(agent);
  const response = await fetch(`${baseUrl}/v1/guard`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      chain: "solana",
      tokenAddress: options.tokenAddress?.trim(),
      rawTransactionBase64: options.rawTransactionBase64?.trim(),
      rpcUrl: options.rpcUrl?.trim(),
    }),
  });

  if (response.status === 402) {
    throw new Error(
      "NullClear free daily quota reached. Configure NULLCLEAR_API_KEY (nc_live_...) in agent.config or use x402 micro-settlement ($0.005 USDC).",
    );
  }

  if (!response.ok) {
    throw new Error(`NullClear guard API error: HTTP ${response.status}`);
  }

  return (await response.json()) as NullClearSolanaGuardReport;
}
