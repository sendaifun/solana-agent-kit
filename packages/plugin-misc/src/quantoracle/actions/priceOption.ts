import { Action } from "solana-agent-kit";
import { z } from "zod";
import { priceOption } from "../tools";

const priceOptionAction: Action = {
  name: "QUANTORACLE_PRICE_OPTION",
  description:
    "Price a European option using Black-Scholes with all 10 Greeks (delta, gamma, theta, vega, rho, vanna, charm, volga, speed, color). Deterministic — same inputs always produce same outputs. 1000 free calls/IP/day, no API key required.",
  similes: [
    "price an option",
    "black scholes option pricing",
    "compute option greeks",
    "get delta gamma theta vega for an option",
    "european option valuation",
  ],
  examples: [
    [
      {
        input: { S: 100, K: 105, T: 0.5, sigma: 0.2, r: 0.05, type: "call" },
        output: {
          price: 4.5817,
          breakeven: 109.5817,
          prob_itm: 0.4056,
          greeks: {
            delta: 0.46116,
            gamma: 0.028076,
            theta: -0.021074,
            vega: 0.280757,
            rho: 0.207672,
          },
        },
        explanation:
          "Price a 6-month ATM-ish call with spot=100, strike=105, 20% vol. Returns $4.58 with delta 0.46.",
      },
    ],
  ],
  schema: z.object({
    S: z.number().positive().describe("Spot price of underlying"),
    K: z.number().positive().describe("Strike price"),
    T: z.number().positive().describe("Time to expiration in years"),
    sigma: z.number().positive().describe("Annualized implied volatility (e.g. 0.2 = 20%)"),
    r: z.number().optional().describe("Risk-free rate (annualized). Default 0.05"),
    q: z.number().optional().describe("Continuous dividend yield. Default 0"),
    type: z.enum(["call", "put"]).optional().describe("Option type. Default call"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await priceOption(agent, input as any);
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

export default priceOptionAction;
