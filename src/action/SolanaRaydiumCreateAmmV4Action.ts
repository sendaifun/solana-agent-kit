import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaRaydiumCreateAmmV4Action: Action = {
  name: "raydium_create_ammV4",
  similes: ["create_amm_v4", "raydium_create_amm"],
  description: `Raydium's Legacy AMM that requires an OpenBook marketID.

  Inputs:
  marketId: string (required)
  baseAmount: number(int) (required)
  quoteAmount: number(int) (required)
  startTime: number(seconds) (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                marketId: "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
                baseAmount: 1000000,
                quoteAmount: 1000000,
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
    const tx = await agent.raydiumCreateAmmV4(
      new PublicKey(input.marketId),
      new BN(input.baseAmount),
      new BN(input.quoteAmount),
      new BN(input.startTime)
    );

    return {
      success: true,
      data: {
        transaction: tx,
        message: "Created Raydium AMM V4 pool successfully"
      }
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        marketId: z.string(),
        baseAmount: z.number().int().positive(),
        quoteAmount: z.number().int().positive(),
        startTime: z.number().int()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
