// okx/actions/OkxDexQuoteAction.ts
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";

// Token address mapping for common tokens
const TOKEN_ADDRESSES: Record<string, string> = {
  'sol': '11111111111111111111111111111111',
  'usdc': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'usdt': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  // Add more tokens as needed
};

const OkxDexQuoteAction: Action = {
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
    ]
  ],
  schema: z.object({
    fromToken: z.string().describe("Source token symbol or address"),
    toToken: z.string().describe("Target token symbol or address"),
    amount: z.number().describe("Amount to swap"),
    slippage: z
      .string()
      .optional()
      .describe("Slippage tolerance (default: 0.5%)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { fromToken, toToken, amount, slippage } = input;

      // Convert token symbols to addresses if needed
      const fromTokenAddress = TOKEN_ADDRESSES[fromToken.toLowerCase()] || fromToken;
      const toTokenAddress = TOKEN_ADDRESSES[toToken.toLowerCase()] || toToken;

      // Convert amount to base units based on token
      let baseUnits;
      if (fromToken.toLowerCase() === "sol" || fromTokenAddress === "11111111111111111111111111111111") {
        baseUnits = (amount * 1e9).toString(); // SOL has 9 decimals
      } else {
        baseUnits = (amount * 1e6).toString(); // Most tokens have 6 decimals
      }

      // Import and use the tool
      const { getOkxDexQuote } = await import('../tools');
      return await getOkxDexQuote(
        agent,
        fromTokenAddress, // Use the resolved address, not the symbol
        toTokenAddress,   // Use the resolved address, not the symbol
        baseUnits,
        slippage,
      );
    } catch (error: any) {
      console.error("Quote error:", error);
      return {
        status: "error",
        message: error.message || "Failed to get quote",
        details: error.stack
      };
    }
  },
};

export default OkxDexQuoteAction;