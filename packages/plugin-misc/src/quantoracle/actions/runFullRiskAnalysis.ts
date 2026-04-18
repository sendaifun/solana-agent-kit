import { Action } from "solana-agent-kit";
import { z } from "zod";
import { runFullRiskAnalysis } from "../tools";

const runFullRiskAnalysisAction: Action = {
  name: "QUANTORACLE_FULL_RISK_ANALYSIS",
  description:
    "Complete risk tearsheet in a single call: Sharpe, Sortino, Calmar, VaR, CVaR, Kelly leverage, max drawdown, Hurst exponent, CAGR. Replaces 7 individual endpoint calls. PAID-ONLY — $0.04 per call via x402 USDC (Base or Solana).",
  similes: [
    "full risk analysis on returns",
    "complete risk tearsheet",
    "compute sharpe sortino var in one call",
    "portfolio risk metrics summary",
    "run a risk report",
  ],
  examples: [
    [
      {
        input: {
          returns: [0.01, -0.02, 0.03, 0.005, -0.01, 0.02, -0.015, 0.025, 0.01, -0.005, 0.015],
          portfolio_value: 10000,
        },
        output: {
          returns: { annualized: 0.84, vol: 0.28, cagr: 1.23 },
          risk: { sharpe: 2.83, sortino: 4.59, var_95: -0.03, max_drawdown: -0.03 },
          kelly: { full_kelly_leverage: 10.65, half_kelly: 5.32 },
        },
        explanation: "Analyze 11 return observations: Sharpe 2.83, Kelly suggests 10.6x leverage.",
      },
    ],
  ],
  schema: z.object({
    returns: z.array(z.number()).min(10).describe("Periodic returns as decimals (e.g. 0.01 = 1%)"),
    portfolio_value: z.number().positive().optional().describe("Current portfolio value. Default 100000"),
    risk_free_rate: z.number().optional().describe("Annual risk-free rate. Default 0.045"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await runFullRiskAnalysis(agent, input as any);
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

export default runFullRiskAnalysisAction;
