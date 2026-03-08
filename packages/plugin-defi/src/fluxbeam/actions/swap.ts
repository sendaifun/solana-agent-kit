import { PublicKey } from "@solana/web3.js";
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fluxbeamSwap } from "../tools/swap";

const fluxbeamSwapAction: Action = {
  name: "FLUXBEAM_SWAP_ACTION",
  similes: [
    "swap tokens on fluxbeam",
    "exchange tokens on fluxbeam",
    "trade tokens on fluxbeam",
    "fluxbeam swap",
    "buy token on fluxbeam",
    "sell token on fluxbeam",
  ],
  description: `Swap tokens using FluxBeam DEX. 
  Specify the input token, output token, amount, and optional slippage.`,
  examples: [
    [
      {
        input: {
          outputMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
          amount: 1,
          inputMint: "So11111111111111111111111111111111111111112", // SOL
        },
        output: {
          status: "success",
          message: "Swap completed successfully on FluxBeam",
          transaction: "5KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Swap 1 SOL for BONK on FluxBeam",
      },
    ],
  ],
  schema: z.object({
    outputMint: z.string().describe("Target token mint address"),
    amount: z.number().positive().describe("Amount of input token to swap"),
    inputMint: z.string().optional().describe("Source token mint address (defaults to SOL)"),
    slippageBps: z.number().optional().describe("Slippage tolerance in basis points (default: 50 = 0.5%)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const txSignature = await fluxbeamSwap(
        agent,
        new PublicKey(input.outputMint),
        input.amount,
        input.inputMint ? new PublicKey(input.inputMint) : undefined,
        input.slippageBps,
      );

      return {
        status: "success",
        message: "Swap completed successfully on FluxBeam",
        transaction: txSignature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `FluxBeam swap failed: ${error.message}`,
        error: error.message,
      };
    }
  },
};

export default fluxbeamSwapAction;
