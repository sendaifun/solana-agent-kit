import { PublicKey } from "@solana/web3.js";
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { orbitSwap } from "../tools";

const orbitSwapAction: Action = {
  name: "ORBIT_SWAP",
  description: "Execute a token swap through an Orbit Finance DLMM pool",
  similes: [
    "swap on orbit",
    "orbit swap",
    "orbit dlmm swap",
    "trade on orbit finance",
    "swap tokens on orbit",
  ],
  examples: [
    [
      {
        input: {
          poolId: "EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB",
          inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          outputMint: "Ciphern9cCXtms66s8Mm6wCFC27b2JProRQLYmiLMH3N",
          inputAmount: 10,
          slippageBps: 100,
        },
        output: {
          status: "success",
          transaction: "5xKpN2...",
          message: "Successfully swapped 10 tokens on Orbit Finance",
        },
        explanation: "Swap 10 USDC for CIPHER through the Orbit DLMM pool with 1% slippage",
      },
    ],
  ],
  schema: z.object({
    poolId: z.string().min(1).describe("Pool public key (base58)"),
    inputMint: z.string().min(1).describe("Input token mint address (base58)"),
    outputMint: z.string().min(1).describe("Output token mint address (base58)"),
    inputAmount: z.number().positive().describe("Amount of input token in human-readable units"),
    slippageBps: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .optional()
      .describe("Max slippage in basis points (default: 100 = 1%)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await orbitSwap(
        agent,
        input.poolId as string,
        new PublicKey(input.inputMint as string),
        new PublicKey(input.outputMint as string),
        input.inputAmount as number,
        input.slippageBps as number | undefined
      );
      return {
        status: "success",
        transaction: signature,
        message: `Successfully swapped ${input.inputAmount} tokens on Orbit Finance`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default orbitSwapAction;
