import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { BN } from "@coral-xyz/anchor";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaRaydiumCreateClmmAction: Action = {
  name: "raydium_create_clmm",
  similes: ["create_clmm", "raydium_create_clmm"],
  description: `Create a Concentrated Liquidity Market Maker (CLMM) pool.

  Inputs:
  mint1: string (required)
  mint2: string (required)
  configId: string (required) - stores pool info, id, index, protocolFeeRate, tradeFeeRate, tickSpacing, fundFeeRate
  initialPrice: number (required)
  startTime: number(seconds) (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                mint1: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                mint2: "So11111111111111111111111111111111111111112",
                configId: "config_pubkey_here",
                initialPrice: 1.5,
                startTime: Math.floor(Date.now() / 1000)
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
    const tx = await agent.raydiumCreateClmm(
      new PublicKey(input.mint1),
      new PublicKey(input.mint2),
      new PublicKey(input.configId),
      new Decimal(input.initialPrice),
      new BN(input.startTime)
    );

    return {
      success: true,
      data: {
        transaction: tx,
        message: "Created Raydium CLMM pool successfully"
      }
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        mint1: z.string(),
        mint2: z.string(),
        configId: z.string(),
        initialPrice: z.number().positive(),
        startTime: z.number().int()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
