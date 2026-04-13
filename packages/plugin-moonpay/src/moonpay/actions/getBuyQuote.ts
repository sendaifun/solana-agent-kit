import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { moonpayGetBuyQuote } from "../tools/getBuyQuote";

const moonpayGetBuyQuoteAction: Action = {
  name: "MOONPAY_GET_BUY_QUOTE",
  similes: [
    "get moonpay buy quote",
    "moonpay on-ramp quote",
    "how much crypto can I buy with fiat",
    "get price to buy sol with usd on moonpay",
    "moonpay fiat to crypto quote",
  ],
  description:
    "Get a quote from MoonPay for purchasing crypto with fiat currency. Returns fee breakdown and exchange rate.",
  examples: [
    [
      {
        input: {
          cryptoCode: "sol",
          fiatCode: "usd",
          amount: 100,
        },
        output: {
          status: "success",
          baseCurrencyAmount: 100,
          quoteCurrencyAmount: 0.89,
          feeAmount: 4.99,
          networkFeeAmount: 0.5,
          totalAmount: 100,
        },
        explanation: "Get a quote to buy SOL with 100 USD on MoonPay",
      },
    ],
  ],
  schema: z.object({
    cryptoCode: z
      .string()
      .min(1)
      .describe("Crypto currency code to buy, e.g. 'sol', 'eth', 'usdc'"),
    fiatCode: z
      .string()
      .min(1)
      .describe("Fiat currency code to spend, e.g. 'usd', 'eur', 'gbp'"),
    amount: z
      .number()
      .positive()
      .describe("Amount of fiat currency to spend"),
  }),
  handler: async (agent, input) => {
    try {
      const quote = await moonpayGetBuyQuote(
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

export default moonpayGetBuyQuoteAction;
