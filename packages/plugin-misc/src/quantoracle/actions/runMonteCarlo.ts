import { Action } from "solana-agent-kit";
import { z } from "zod";
import { runMonteCarlo } from "../tools";

const runMonteCarloAction: Action = {
  name: "QUANTORACLE_MONTE_CARLO_SIM",
  description:
    "Run a Monte Carlo simulation of portfolio value using Geometric Brownian Motion with optional contributions/withdrawals. Returns terminal distribution (p5/p25/p50/p75/p95), probability of loss, probability of doubling, CAGR. $0.015 per call via x402 past the free tier.",
  similes: [
    "monte carlo simulation of a portfolio",
    "retirement projection",
    "gbm simulation",
    "probability of doubling my money",
    "portfolio projection with contributions",
  ],
  examples: [
    [
      {
        input: { initial_value: 100000, annual_return: 0.08, annual_vol: 0.15, years: 30, simulations: 1000 },
        output: {
          terminal: { mean: 1075981, median: 764033, p5: 203883, p95: 3079865 },
          prob_loss: 0.003,
          prob_double: 0.952,
          cagr: 0.0824,
        },
        explanation: "$100k at 8%/15% vol over 30 years: median $764k, 95.2% probability of doubling.",
      },
    ],
  ],
  schema: z.object({
    initial_value: z.number().positive().optional().describe("Default 100000"),
    annual_return: z.number().optional().describe("Default 0.1"),
    annual_vol: z.number().positive().optional().describe("Default 0.2"),
    years: z.number().positive().max(100).optional().describe("Default 5"),
    simulations: z.number().int().min(1).max(5000).optional().describe("Default 1000"),
    contributions: z.number().optional().describe("Annual contribution amount. Default 0"),
    withdrawal_rate: z.number().optional().describe("Annual withdrawal as fraction. Default 0"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await runMonteCarlo(agent, input as any);
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

export default runMonteCarloAction;
