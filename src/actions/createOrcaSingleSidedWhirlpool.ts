import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { orcaCreateSingleSidedLiquidityPool } from "../tools";

// Fee tiers mapping from the original tool
const FEE_TIERS = {
  0.01: 1,
  0.02: 2,
  0.04: 4,
  0.05: 8,
  0.16: 16,
  0.3: 64,
  0.65: 96,
  1.0: 128,
  2.0: 256,
} as const;

const createOrcaSingleSidedWhirlpoolAction: Action = {
  name: "CREATE_ORCA_SINGLE_SIDED_WHIRLPOOL",
  similes: [
    "create orca whirlpool",
    "setup orca single sided pool",
    "initialize orca whirlpool",
    "create orca concentrated pool",
    "setup orca concentrated liquidity",
    "create orca trading pair",
  ],
  description:
    "Create a new single-sided whirlpool on Orca with concentrated liquidity",
  examples: [
    [
      {
        input: {
          depositTokenAmount: "1000000000000", // 1 million tokens with 6 decimals
          depositTokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
          otherTokenMint: "So11111111111111111111111111111111111111112", // SOL
          initialPrice: "0.001",
          maxPrice: "5.0",
          feeTier: 0.3,
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully created Orca single-sided whirlpool",
        },
        explanation:
          "Create a USDC/SOL whirlpool with 1M USDC initial liquidity",
      },
    ],
  ],
  schema: z.object({
    depositTokenAmount: z
      .string()
      .min(1)
      .describe(
        "The amount of deposit token to provide as liquidity (including decimals)",
      ),
    depositTokenMint: z
      .string()
      .min(1)
      .describe("The mint address of the token being deposited"),
    otherTokenMint: z
      .string()
      .min(1)
      .describe("The mint address of the other token in the pool"),
    initialPrice: z
      .string()
      .min(1)
      .describe("Initial price of deposit token in terms of the other token"),
    maxPrice: z
      .string()
      .min(1)
      .describe("Maximum price at which liquidity is added"),
    feeTier: z
      .number()
      .refine((val) => val in FEE_TIERS, "Invalid fee tier")
      .describe("Fee tier percentage for the pool (e.g., 0.3 for 0.3%)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const depositTokenAmount = Number(input.depositTokenAmount);
      const depositTokenMint = new PublicKey(input.depositTokenMint);
      const otherTokenMint = new PublicKey(input.otherTokenMint);
      const initialPrice = new Decimal(input.initialPrice);
      const maxPrice = new Decimal(input.maxPrice);
      const feeTier = input.feeTier;

      // Create the whirlpool
      const signature = await orcaCreateSingleSidedLiquidityPool(
        agent,
        depositTokenAmount,
        depositTokenMint,
        otherTokenMint,
        initialPrice,
        maxPrice,
        feeTier,
      );

      return {
        status: "success",
        signature,
        message: "Successfully created Orca single-sided whirlpool",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create whirlpool: ${error.message}`,
      };
    }
  },
};

export default createOrcaSingleSidedWhirlpoolAction;
