import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { BN } from "@coral-xyz/anchor";
import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";
import { FEE_TIERS } from "../tools";

export const SolanaCreateSingleSidedWhirlpoolAction: Action = {
  name: "create_orca_single_sided_whirlpool",
  similes: ["create_whirlpool", "single_sided_whirlpool"],
  description: `Create a single-sided Whirlpool with liquidity.

  Inputs:
  depositTokenAmount: number (required, in units of deposit token including decimals)
  depositTokenMint: string (required, mint address of deposit token)
  otherTokenMint: string (required, mint address of other token)
  initialPrice: number (required, initial price of deposit token in terms of other token)
  maxPrice: number (required, maximum price at which liquidity is added)
  feeTier: number (required, fee tier for the pool)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                depositTokenAmount: 1000000000,
                depositTokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                otherTokenMint: "So11111111111111111111111111111111111111112",
                initialPrice: 0.001,
                maxPrice: 5.0,
                feeTier: 0.3
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: { 
          success: true, 
          data: { txId: "transaction_hash_here" }
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const txId = await agent.createOrcaSingleSidedWhirlpool(
      new BN(input.depositTokenAmount),
      new PublicKey(input.depositTokenMint),
      new PublicKey(input.otherTokenMint),
      new Decimal(input.initialPrice),
      new Decimal(input.maxPrice),
      input.feeTier,
    );

    return {
      success: true,
      data: {
        transaction: txId,
        message: "Single-sided Whirlpool created successfully"
      }
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        depositTokenAmount: z.number().positive(),
        depositTokenMint: z.string(),
        otherTokenMint: z.string(),
        initialPrice: z.number().positive(),
        maxPrice: z.number().positive(),
        feeTier: z.number().refine((val) => val in FEE_TIERS),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};