import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Action } from "solana-agent-kit";
import { z } from "zod";
import { createMeteoraDlmmPool } from "../tools";

const createMeteoraDLMMPoolAction: Action = {
  name: "CREATE_METEORA_DLMM_POOL",
  description: "Create a new Meteora DLMM pool",
  similes: [
    "create Meteora DLMM pool",
    "setup Meteora DLMM pool",
    "new Meteora DLMM pool",
    "create DLMM pool",
    "setup Meteora DLMM pool",
    "new DLMM pool",
  ],
  examples: [
    [
      {
        input: {
          binStep: 100,
          tokenAMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenBMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
          initialPrice: 1,
          priceRoundingUp: false,
          feeBps: 1000,
          activationType: "Timestamp",
          hasAlphaVault: false,
          activationPoint: 0,
        },
        output: {
          status: "success",
          transaction: "78fj2...",
          message: "Successfully created Meteora DLMM pool",
        },
        explanation: "Create a new Meteora DLMM pool for USDC/JUP",
      },
    ],
  ],
  schema: z.object({
    binStep: z.number().positive().describe("DLMM pool bin step"),
    tokenAMint: z.string().min(1).describe("The token A mint address"),
    tokenBMint: z.string().min(1).describe("The token B mint address"),
    initialPrice: z
      .number()
      .positive()
      .describe("Initial pool price in ratio tokenA / tokenB"),
    priceRoundingUp: z
      .boolean()
      .describe("Whether to rounding up the initial pool price")
      .optional(),
    feeBps: z.number().positive().describe("Pool trading fee in BPS"),
    activationType: z
      .enum(["Timestamp", "Slot"])
      .describe("Pool activation type")
      .optional(),
    hasAlphaVault: z
      .boolean()
      .describe("Whether the pool has Meteora alpha vault or not")
      .optional()
      .default(false),
    activationPoint: z
      .number()
      .describe(
        "Activation point depending on activation type, or null if pool doesn't have an activation point",
      )
      .optional(),
  }),
  handler: async (agent, input) => {
    try {
      const tokenAMint = new PublicKey(input.tokenAMint);
      const tokenBMint = new PublicKey(input.tokenBMint);
      const binStep = input.binStep;
      const initialPrice = input.initialPrice;
      const feeBps = input.feeBps;
      const priceRoundingUp = input.priceRoundingUp ?? true;
      const activationType = input.activationType ?? 1;
      const activationPoint = input.activationPoint
        ? new BN(input.activationPoint)
        : undefined;
      const hasAlphaVault = input.hasAlphaVault ?? false;

      const transaction = await createMeteoraDlmmPool(
        agent,
        binStep,
        tokenAMint,
        tokenBMint,
        initialPrice,
        priceRoundingUp,
        feeBps,
        activationType,
        hasAlphaVault,
        activationPoint,
      );

      return {
        status: "success",
        message: "Meteora DLMM pool created successfully.",
        transaction,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  },
};

export default createMeteoraDLMMPoolAction;
