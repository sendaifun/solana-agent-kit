import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { swapFluxBeam } from "../../tools";

const fluxbeamSwapAction: Action = {
  name: "FLUXBEAM_SWAP",
  similes: [
    "swap tokens on fluxbeam",
    "exchange tokens using fluxbeam",
    "trade on fluxbeam",
    "convert tokens via fluxbeam",
    "use fluxbeam dex",
  ],
  description: `This tool allows you to swap tokens using the FluxBeam DEX on Solana.`,
  examples: [
    [
      {
        input: {
          outputMint: "So11111111111111111111111111111111111111112",
          inputAmount: 100,
          inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          message: "Swap executed successfully on FluxBeam",
          transactionSignature:
            "3KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          inputAmount: 100,
          inputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          outputToken: "So11111111111111111111111111111111111111112",
        },
        explanation: "Swap 100 USDC for SOL using FluxBeam DEX",
      },
    ],
    [
      {
        input: {
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          inputAmount: 1,
          slippageBps: 100,
        },
        output: {
          status: "success",
          message: "Swap executed successfully on FluxBeam",
          transactionSignature:
            "2UfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          inputAmount: 1,
          inputToken: "SOL",
          outputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        explanation: "Swap 1 SOL for USDC with 1% slippage on FluxBeam",
      },
    ],
  ],
  schema: z.object({
    outputMint: z
      .string()
      .min(32, "Invalid output mint address")
      .describe("The token mint address you want to receive"),
    inputAmount: z
      .number()
      .positive("Input amount must be positive")
      .describe("The amount of tokens to swap"),
    inputMint: z
      .string()
      .min(32, "Invalid input mint address")
      .optional()
      .describe(
        "The token mint address you want to swap from (default is SOL)",
      ),
    slippageBps: z
      .number()
      .min(0)
      .max(10000)
      .optional()
      .describe("Slippage tolerance in basis points (default: 0)"),
  }),
  handler: async (
    solanaAgent: SolanaAgentKit,
    swapParams: Record<string, any>,
  ) => {
    try {
      // Extract parameters with optional defaults
      const { outputMint, inputAmount, inputMint, slippageBps } = swapParams;

      // Execute the token swap on FluxBeam DEX
      const transactionSignature = await swapFluxBeam(
        solanaAgent,
        new PublicKey(outputMint),
        inputAmount,
        inputMint ? new PublicKey(inputMint) : undefined, // Default to SOL if inputMint is not provided
        slippageBps,
      );

      // Return success response
      return {
        status: "success",
        message: "Swap executed successfully on FluxBeam",
        transactionSignature,
        inputAmount,
        inputToken: inputMint || "SOL", // Default to "SOL" if inputMint is not provided
        outputToken: outputMint,
      };
    } catch (error: any) {
      // Handle error and return a detailed response
      return {
        status: "error",
        message: `FluxBeam swap failed: ${error.message}`,
        error: error.message,
      };
    }
  },
};

export default fluxbeamSwapAction;
