import type { SolanaAgentKit } from "solana-agent-kit";

const QUANTORACLE_BASE_URL = "https://api.quantoracle.dev";

/**
 * Shared fetch helper for all QuantOracle endpoints.
 * Free tier: 1000 calls/IP/day. Paid endpoints return 402 with x402 payment
 * requirements (USDC on Base or Solana). This client does not auto-pay —
 * callers exhausting the free tier should use an x402-capable HTTP client.
 */
export async function callQuantOracle<T = any>(
  _agent: SolanaAgentKit,
  endpoint: string,
  params: Record<string, any>
): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const resp = await fetch(`${QUANTORACLE_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "solana-agent-kit-quantoracle/1.0.0",
      "X-Source": "solana-agent-kit",
    },
    body: JSON.stringify(params),
  });

  if (resp.status === 402) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(
      `QuantOracle: payment required (${endpoint}). Free tier exhausted. Pay via x402 USDC on Base or Solana. Details: ${JSON.stringify(
        body
      ).slice(0, 200)}`
    );
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `QuantOracle ${endpoint} failed (${resp.status}): ${text.slice(0, 300)}`
    );
  }
  return (await resp.json()) as T;
}

export async function priceOption(
  agent: SolanaAgentKit,
  input: { S: number; K: number; T: number; sigma: number; r?: number; q?: number; type?: "call" | "put" }
) {
  return callQuantOracle(agent, "/v1/options/price", input);
}

export async function runFullRiskAnalysis(
  agent: SolanaAgentKit,
  input: { returns: number[]; portfolio_value?: number; risk_free_rate?: number }
) {
  return callQuantOracle(agent, "/v1/risk/full-analysis", input);
}

export async function backtestStrategy(
  agent: SolanaAgentKit,
  input: {
    prices: number[];
    strategy: "sma_crossover" | "rsi_mean_reversion" | "momentum" | "bollinger_breakout";
    params?: Record<string, number>;
    initial_capital?: number;
    commission_bps?: number;
    slippage_bps?: number;
  }
) {
  return callQuantOracle(agent, "/v1/backtest/strategy", input);
}

export async function optimizeOptionsStrategy(
  agent: SolanaAgentKit,
  input: {
    S: number;
    outlook: "bullish" | "bearish" | "neutral";
    vol_view?: "rising" | "falling" | "stable";
    T: number;
    sigma: number;
    r?: number;
    q?: number;
    capital?: number;
  }
) {
  return callQuantOracle(agent, "/v1/options/strategy-optimizer", input);
}

export async function recommendHedge(
  agent: SolanaAgentKit,
  input: {
    position_type: "long_stock" | "short_stock" | "long_crypto" | "long_options";
    position_value: number;
    asset_price: number;
    volatility: number;
    time_horizon_days?: number;
    max_hedge_cost_pct?: number;
  }
) {
  return callQuantOracle(agent, "/v1/hedging/recommend", input);
}

export async function planRebalance(
  agent: SolanaAgentKit,
  input: {
    current_holdings: Record<string, number>;
    target_weights: Record<string, number>;
    transaction_cost_bps?: number;
    min_trade_usd?: number;
  }
) {
  return callQuantOracle(agent, "/v1/portfolio/rebalance-plan", input);
}

export async function runMonteCarlo(
  agent: SolanaAgentKit,
  input: {
    initial_value?: number;
    annual_return?: number;
    annual_vol?: number;
    years?: number;
    simulations?: number;
    contributions?: number;
    withdrawal_rate?: number;
  }
) {
  return callQuantOracle(agent, "/v1/simulate/montecarlo", input);
}

export async function computeImpermanentLoss(
  agent: SolanaAgentKit,
  input: {
    current_price_ratio: number;
    initial_value?: number;
    pool_type?: "v2" | "v3";
    range_low?: number;
    range_high?: number;
  }
) {
  return callQuantOracle(agent, "/v1/crypto/impermanent-loss", input);
}

export async function computeLiquidationPrice(
  agent: SolanaAgentKit,
  input: {
    entry_price: number;
    collateral: number;
    position_size: number;
    leverage: number;
    direction: "long" | "short";
    maintenance_margin?: number;
  }
) {
  return callQuantOracle(agent, "/v1/crypto/liquidation-price", input);
}

export async function getLiveVolatility(
  agent: SolanaAgentKit,
  input: { asset: string }
) {
  return callQuantOracle(agent, "/v1/live/volatility", input);
}

export async function getLiveFundingRate(
  agent: SolanaAgentKit,
  input: { asset: string }
) {
  return callQuantOracle(agent, "/v1/live/funding-rates", input);
}
