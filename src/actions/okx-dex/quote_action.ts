// src/actions/okx-dex/quote_action.ts
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getQuote } from "../../tools/okx-dex";

const TOKEN_ADDRESSES = {
  sol: "So11111111111111111111111111111111111111112",
  usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  usdt: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  wif: "2222222222222222222222222222222222222222222222222222222222222222",
};

const okxDexQuoteAction: Action = {
  name: "OKX_DEX_QUOTE",
  similes: ["get quote", "check price", "okx dex quote"],
  description: "Get a quote for swapping tokens on OKX DEX.",
  examples: [
    [
      {
        input: {
          fromToken: "sol",
          toToken: "usdc",
          amount: 0.1,
        },
        output: {
          status: "success",
          summary: {
            fromToken: "SOL",
            toToken: "USDC",
            fromAmount: 0.1,
            toAmount: 10.5,
            exchangeRate: 105,
            priceImpact: "0.01%",
          },
        },
        explanation: "Getting a quote for swapping 0.1 SOL to USDC",
      },
    ],
  ],
  schema: z.object({
    fromToken: z.string().describe("Source token symbol or address"),
    toToken: z.string().describe("Target token symbol or address"),
    amount: z.number().describe("Amount to swap"),
    slippage: z
      .string()
      .optional()
      .describe("Slippage tolerance (default: 0.001)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const { fromToken, toToken, amount, slippage } = input;

    const fromTokenAddress = fromToken;
    const toTokenAddress = toToken;

    // Convert amount to base units
    let baseUnits;
    if (fromToken.toLowerCase() === "sol") {
      baseUnits = (amount * 1e9).toString(); // SOL has 9 decimals
    } else {
      baseUnits = (amount * 1e6).toString(); // Most tokens have 6 decimals
    }

    return await getQuote(
      agent,
      fromTokenAddress,
      toTokenAddress,
      baseUnits,
      slippage,
    );
  },
};

export default okxDexQuoteAction;
