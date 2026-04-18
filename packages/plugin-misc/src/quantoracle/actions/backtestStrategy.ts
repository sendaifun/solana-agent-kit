import { Action } from "solana-agent-kit";
import { z } from "zod";
import { backtestStrategy } from "../tools";

const backtestStrategyAction: Action = {
  name: "QUANTORACLE_BACKTEST_STRATEGY",
  description:
    "Run a deterministic backtest of a trading strategy on a price history. Supports sma_crossover, rsi_mean_reversion, momentum, and bollinger_breakout. Returns Sharpe, Calmar, max drawdown, number of trades, win rate, equity curve, and vs buy-and-hold comparison. PAID-ONLY — $0.10 per call via x402.",
  similes: [
    "backtest an sma crossover strategy",
    "test rsi mean reversion on prices",
    "run a momentum backtest",
    "evaluate a bollinger breakout strategy",
    "deterministic strategy backtest",
  ],
  examples: [
    [
      {
        input: {
          prices: [100, 101, 102, 103, 104, 105, 106, 105, 104, 103, 102, 101, 100, 99, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115],
          strategy: "sma_crossover",
          params: { fast: 5, slow: 15 },
        },
        output: {
          strategy: "sma_crossover",
          performance: { sharpe: 1.85, total_return: 0.12, max_drawdown: -0.05 },
          trades_summary: { total: 3, win_rate: 0.67 },
          vs_buy_hold: { excess_return: 0.03 },
        },
        explanation: "5/15 SMA crossover on 32 bars returns 12% with 3 trades, +3% vs buy&hold.",
      },
    ],
  ],
  schema: z.object({
    prices: z.array(z.number()).min(30).describe("Price history (daily closes, oldest first). Min 30 bars."),
    strategy: z
      .enum(["sma_crossover", "rsi_mean_reversion", "momentum", "bollinger_breakout"])
      .describe("Strategy type"),
    params: z
      .record(z.union([z.number(), z.string()]))
      .optional()
      .describe(
        "Strategy-specific params. SMA: {fast, slow}. RSI: {period, oversold, overbought}. Momentum: {lookback}. Bollinger: {period, std}."
      ),
    initial_capital: z.number().positive().optional().describe("Default 10000"),
    commission_bps: z.number().min(0).optional().describe("Round-trip commission in basis points. Default 5"),
    slippage_bps: z.number().min(0).optional().describe("One-way slippage in basis points. Default 5"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await backtestStrategy(agent, input as any);
      return { status: "success", result };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is not a property of unknown
        message: e.message,
      };
    }
  },
};

export default backtestStrategyAction;
