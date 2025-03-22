import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { executeSwap, getQuote } from "../../tools/okx-dex";

const TOKEN_ADDRESSES = {
  sol: "So11111111111111111111111111111111111111112",
  usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  usdt: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  wif: "2222222222222222222222222222222222222222222222222222222222222222",
};

const okxDexSwapAction: Action = {
  name: "OKX_DEX_SWAP",
  similes: ["swap tokens", "swap", "okx dex swap"],
  description: "Swap tokens on OKX DEX.",
  examples: [
    [
      {
        input: {
          fromToken: "sol",
          toToken: "usdc",
          amount: 0.1,
          slippage: "0.001",
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
            txId: "5KtPn3...",
            explorerUrl: "https://www.okx.com/web3/explorer/sol/tx/5KtPn3...",
          },
        },
        explanation: "Swap 0.1 SOL to USDC with 0.1% slippage",
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
      baseUnits = amount * Math.pow(10, 9);
    } else {
      baseUnits = amount * Math.pow(10, 6);
    }

    // Get quote
    const quote = await getQuote(
      agent,
      fromTokenAddress,
      toTokenAddress,
      baseUnits.toString(),
      slippage,
    );

    // Execute swap
    const swapResult = await executeSwap(
      agent,
      fromTokenAddress,
      toTokenAddress,
      baseUnits.toString(),
      slippage,
    );

    return {
      status: "success",
      summary: {
        fromToken: quote.fromToken,
        toToken: quote.toToken,
        fromAmount: quote.fromAmount,
        toAmount: quote.toAmount,
        exchangeRate: quote.exchangeRate,
        priceImpact: quote.priceImpact,
        txId: swapResult.txId,
        explorerUrl: swapResult.explorerUrl,
      },
      data: swapResult,
    };
  },
};

export default okxDexSwapAction;
