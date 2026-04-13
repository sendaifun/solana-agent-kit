import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { moonpayGenerateOffRampUrl } from "../tools/generateOffRampUrl";

const moonpayGenerateOffRampUrlAction: Action = {
  name: "MOONPAY_GENERATE_OFF_RAMP_URL",
  similes: [
    "generate moonpay sell link",
    "create moonpay off-ramp url",
    "get moonpay widget url to sell crypto",
    "moonpay sell crypto link",
    "create crypto to fiat sell url",
  ],
  description:
    "Generate a MoonPay off-ramp widget URL that can be opened in a browser to sell crypto for fiat currency.",
  examples: [
    [
      {
        input: {
          cryptoCode: "sol",
          amount: 1,
          fiatCode: "usd",
        },
        output: {
          status: "success",
          url: "https://sell.moonpay.com?apiKey=...&baseCurrencyCode=sol&baseCurrencyAmount=1&quoteCurrencyCode=usd",
        },
        explanation: "Generate a MoonPay URL to sell 1 SOL for USD",
      },
    ],
  ],
  schema: z.object({
    cryptoCode: z
      .string()
      .min(1)
      .describe("Crypto currency code to sell, e.g. 'sol', 'eth', 'usdc'"),
    amount: z
      .number()
      .positive()
      .optional()
      .describe("Amount of crypto to pre-fill in the widget"),
    fiatCode: z
      .string()
      .optional()
      .default("usd")
      .describe("Target fiat currency code (default: 'usd')"),
  }),
  handler: async (agent, input) => {
    try {
      const url = await moonpayGenerateOffRampUrl(
        agent,
        input.cryptoCode,
        input.amount,
        input.fiatCode,
      );
      return { status: "success", url };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};

export default moonpayGenerateOffRampUrlAction;
