import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { moonpayGenerateOnRampUrl } from "../tools/generateOnRampUrl";

const moonpayGenerateOnRampUrlAction: Action = {
  name: "MOONPAY_GENERATE_ON_RAMP_URL",
  similes: [
    "generate moonpay buy link",
    "create moonpay on-ramp url",
    "get moonpay widget url to buy crypto",
    "moonpay buy crypto link",
    "create fiat to crypto purchase url",
  ],
  description:
    "Generate a MoonPay on-ramp widget URL that can be opened in a browser to buy crypto with fiat currency. The agent's wallet address is used by default.",
  examples: [
    [
      {
        input: {
          cryptoCode: "sol",
          amount: 100,
          fiatCode: "usd",
        },
        output: {
          status: "success",
          url: "https://buy.moonpay.com?apiKey=...&currencyCode=sol&walletAddress=...&baseCurrencyAmount=100&baseCurrencyCode=usd",
        },
        explanation: "Generate a MoonPay URL to buy SOL with 100 USD",
      },
    ],
  ],
  schema: z.object({
    cryptoCode: z
      .string()
      .min(1)
      .describe("Crypto currency code to buy, e.g. 'sol', 'eth', 'usdc'"),
    walletAddress: z
      .string()
      .optional()
      .describe(
        "Destination wallet address. Defaults to the agent's wallet address.",
      ),
    amount: z
      .number()
      .positive()
      .optional()
      .describe("Fiat amount to pre-fill in the widget"),
    fiatCode: z
      .string()
      .optional()
      .default("usd")
      .describe("Fiat currency code (default: 'usd')"),
  }),
  handler: async (agent, input) => {
    try {
      const url = await moonpayGenerateOnRampUrl(
        agent,
        input.cryptoCode,
        input.walletAddress,
        input.amount,
        input.fiatCode,
      );
      return { status: "success", url };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};

export default moonpayGenerateOnRampUrlAction;
