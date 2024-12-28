import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaRaydiumCreateCpmmAction: Action = {
  name: "raydium_create_cpmm",
  similes: ["create_cpmm", "raydium_create_cpmm"],
  description: `Create Raydium's newest CPMM pool that supports Token 2022 standard.

  Inputs:
  mint1: string (required)
  mint2: string (required)
  configId: string (required) - stores pool info, index, protocolFeeRate, tradeFeeRate, fundFeeRate
  mintAAmount: number(int) (required)
  mintBAmount: number(int) (required)
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
                mintAAmount: 1000000,
                mintBAmount: 1000000,
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
    const tx = await agent.raydiumCreateCpmm(
      new PublicKey(input.mint1),
      new PublicKey(input.mint2),
      new PublicKey(input.configId),
      new BN(input.mintAAmount),
      new BN(input.mintBAmount),
      new BN(input.startTime)
    );

    return {
      success: true,
      data: {
        transaction: tx,
        message: "Created Raydium CPMM pool successfully"
      }
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        mint1: z.string(),
        mint2: z.string(),
        configId: z.string(),
        mintAAmount: z.number().int().positive(),
        mintBAmount: z.number().int().positive(),
        startTime: z.number().int()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
