import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { moonpayGetSellQuote } from "../tools/getSellQuote";

const moonpayGetSellQuoteAction: Action = {
  name: "MOONPAY_GET_SELL_QUOTE",
  similes: [
    "get moonpay sell quote",
    "moonpay off-ramp quote",
    "how much fiat will I get for crypto on moonpay",
    "sell sol for usd on moonpay quote",
    "moonpay crypto to fiat quote",
  ],
  description:
    "Get a quote from MoonPay for selling crypto to fiat currency. Returns fee breakdown and exchange rate.",
  examples: [
    [
      {
        input: {
          cryptoCode: "sol",
          fiatCode: "usd",
          amount: 1,
        },
        output: {
          status: "success",
          baseCurrencyAmount: 1,
          quoteCurrencyAmount: 108.5,
          feeAmount: 2.5,
          networkFeeAmount: 0.3,
          totalAmount: 1,
        },
        explanation: "Get a quote to sell 1 SOL for USD on MoonPay",
      },
    ],
  ],
  schema: z.object({
    cryptoCode: z
      .string()
      .min(1)
      .describe("Crypto currency code to sell, e.g. 'sol', 'eth', 'usdc'"),
    fiatCode: z
      .string()
      .min(1)
      .describe("Fiat currency code to receive, e.g. 'usd', 'eur', 'gbp'"),
    amount: z
      .number()
      .positive()
      .describe("Amount of crypto to sell"),
  }),
  handler: async (agent, input) => {
    try {
      const quote = await moonpayGetSellQuote(
        agent,
        input.cryptoCode,
        input.fiatCode,
        input.amount,
      );
      return { status: "success", ...quote };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};

export default moonpayGetSellQuoteAction;
