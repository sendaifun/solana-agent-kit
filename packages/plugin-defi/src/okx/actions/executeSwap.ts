import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { executeSwap } from "../tools/execute_swap";

const executeSwapAction: Action = {
  name: "OKX_EXECUTE_SWAP",
  description: "Execute swap through okx dex",
  similes: [
    "execute swap token through okx",
    "swap token through okx dex",
    "run swap thouch okx dex",
  ],
  examples: [
    [
      {
        input: {
          chainId: "501", // Solana
          fromTokenAddress: "7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o",
          toTokenAddress: "So11111111111111111111111111111111111111112",
          userWalletAddress: "B2cCedQDK9P5oZLaH3p4vKK3SUthG1mVhV4n5f45mZcS",
          amount: "100000000",
          slippage: "0.2",
        },
        output: {
          success: true,
          transactionId:
            "5QNZGUYPsngrXJgJEJ7N4SrjaaGP9B44Jt8pZz5nFVYk21VNrZjFd7Xhu3kPBbbauoxHj2UjKLnshZ9dsPYUFKb7",
          explorerUrl:
            "https://www.okx.com/web3/explorer/sol/tx/5QNZGUYPsngrXJgJEJ7N4SrjaaGP9B44Jt8pZz5nFVYk21VNrZjFd7Xhu3kPBbbauoxHj2UjKLnshZ9dsPYUFKb7",
          details: {
            fromToken: { symbol: "wSOL", amount: "0.010000", decimal: "9" },
            toToken: { symbol: "HOMO", amount: "1388.108452", decimal: "6" },
            priceImpact: "-0.55",
          },
        },
        explanation: "execute swap through okx dex",
      },
    ],
  ],
  schema: z.object({
    chainId: z.string().describe("Unique identifier for the chain"),
    fromTokenAddress: z
      .string()
      .describe("Address of the mint account being swapped from"),
    toTokenAddress: z
      .string()
      .describe("Address of the mint account being swapped to"),
    userWalletAddress: z.string().describe("The account of user"),
    amount: z.string().describe("Token amount for the quote."),
    slippage: z.string().describe("Slippage limit"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const {
        chainId,
        fromTokenAddress,
        toTokenAddress,
        userWalletAddress,
        amount,
        slippage,
      } = input;

      const result = await executeSwap(
        agent,
        chainId,
        fromTokenAddress,
        toTokenAddress,
        userWalletAddress,
        amount,
        slippage
      );

      return {
        status: "success",
        message: "Successfully execute swap",
        data: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to execute swap from okx ${error.message}`,
        code: error.code || "OKX_EXECUTE_SWAP",
      };
    }
  },
};

export default executeSwapAction;
