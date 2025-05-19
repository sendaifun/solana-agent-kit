// okx/actions/OkxDexSwapAction.ts
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";

// Token address mapping for common tokens
const TOKEN_ADDRESSES: Record<string, string> = {
  'sol': '11111111111111111111111111111111',
  'usdc': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'usdt': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  // Add more tokens as needed
};

// List of known stablecoins that use 6 decimals
const STABLECOINS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  '11111111111111111111111111111111', // SOL
];

const OkxDexSwapAction: Action = {
  name: "OKX_DEX_SWAP",
  similes: ["swap", "swap tokens", "swap on okx dex"],
  description: "Execute a token swap on OKX DEX. This is a two-step process: first get a quote, then execute the swap if the quote is accepted. Return only transaction links with OKX Explorer. https://web3.okx.com/explorer/solana/tx/",
  examples: [
    [
      {
        input: {
          fromToken: "sol",
          toToken: "usdc",
          amount: 0.1,
          slippage: "0.5",
          execute: false, // Get quote only
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
            tradeFee: "0.5",
            estimateGasFee: "0.000005",
          },
          needsExecution: true,
          message: "Quote received. Use execute: true to proceed with the swap."
        },
        explanation: "Getting a quote for swapping 0.1 SOL to USDC",
      },
    ],
    [
      {
        input: {
          fromToken: "sol",
          toToken: "usdc",
          amount: 0.1,
          slippage: "0.5",
          execute: true, // Execute the swap
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
            tradeFee: "0.5",
            estimateGasFee: "0.000005",
          },
          signature: "https://web3.okx.com/explorer/solana/tx/1ciBNVyC1TkEBwTj7TqcAUKAiMAYPWZ658pZMJHUK2XgmyDUMHtgiNwKw1wzCPww2UPcvdx6uXGg7Y3BAe5HZZd",
          message: "Swap executed successfully!"
        },
        explanation: "Executing a swap of 0.1 SOL to USDC",
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
    swapReceiverAddress: z
      .string()
      .optional()
      .describe("Optional recipient address (defaults to user's wallet)"),
    feePercent: z
      .string()
      .optional()
      .describe("Optional fee percentage for referrer (0-10 for Solana)"),
    fromTokenReferrerWalletAddress: z
      .string()
      .optional()
      .describe("Optional referrer address for fromToken fee"),
    toTokenReferrerWalletAddress: z
      .string()
      .optional()
      .describe("Optional referrer address for toToken fee"),
    positiveSlippagePercent: z
      .string()
      .optional()
      .describe("Optional positive slippage percentage (0-10)"),
    computeUnitPrice: z
      .string()
      .optional()
      .describe("Optional compute unit price for Solana"),
    computeUnitLimit: z
      .string()
      .optional()
      .describe("Optional compute unit limit for Solana"),
    directRoute: z
      .boolean()
      .optional()
      .describe("Optional flag to restrict to single liquidity pool"),
    priceImpactProtectionPercentage: z
      .string()
      .optional()
      .describe("Optional price impact protection (0-1)"),
    execute: z
      .boolean()
      .optional()
      .describe("Whether to execute the swap after getting the quote (default: false)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const {
        fromToken,
        toToken,
        amount,
        slippage,
        swapReceiverAddress,
        feePercent,
        fromTokenReferrerWalletAddress,
        toTokenReferrerWalletAddress,
        positiveSlippagePercent,
        computeUnitPrice,
        computeUnitLimit,
        directRoute,
        priceImpactProtectionPercentage,
        execute = false,
      } = input;

      // Convert token symbols to addresses if needed
      const fromTokenAddress = TOKEN_ADDRESSES[fromToken.toLowerCase()] || fromToken;
      const toTokenAddress = TOKEN_ADDRESSES[toToken.toLowerCase()] || toToken;

      // Convert amount to base units based on token
      let baseUnits;
      if (fromToken.toLowerCase() === "sol" || fromTokenAddress === "11111111111111111111111111111111") {
        // For SOL, multiply by 1e9 and ensure we have a whole number
        const lamports = amount * 1e9;
        baseUnits = Math.round(lamports).toString();
      } else if (STABLECOINS.includes(fromTokenAddress)) {
        // For stablecoins, use 6 decimals
        const tokenUnits = amount * 1e6;
        baseUnits = Math.round(tokenUnits).toString();
      } else {
        // For all other tokens, use 18 decimals
        const tokenUnits = amount * 1e18;
        baseUnits = Math.round(tokenUnits).toString();
      }

      // Import and use the tool
      const { getOkxSwap, executeSwapTransaction } = await import('../tools');
      const swapResult = await getOkxSwap(
        agent,
        fromTokenAddress,
        toTokenAddress,
        baseUnits,
        slippage,
        agent.wallet.publicKey.toBase58(), // User's wallet address
        swapReceiverAddress,
        feePercent,
        fromTokenReferrerWalletAddress,
        toTokenReferrerWalletAddress,
        positiveSlippagePercent,
        computeUnitPrice,
        computeUnitLimit,
        directRoute,
        priceImpactProtectionPercentage,
        execute
      );

      // If execute is true and we have a prepared transaction, execute it
      if (execute && swapResult.preparedTransaction) {
        const signature = await executeSwapTransaction(agent, swapResult.preparedTransaction);
        return {
          ...swapResult,
          signature,
          message: "Swap executed successfully!"
        };
      }

      // Return the quote with a flag indicating it needs execution
      return {
        ...swapResult,
        needsExecution: true,
        message: "Quote received. Use execute: true to proceed with the swap."
      };
    } catch (error: any) {
      console.error("Swap error:", error);
      return {
        status: "error",
        message: error.message || "Failed to execute swap",
        details: error.stack
      };
    }
  },
};

export default OkxDexSwapAction;