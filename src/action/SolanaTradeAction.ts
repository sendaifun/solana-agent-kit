// SolanaTradeAction.ts
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaTradeAction: Action = {
  name: "solana_trade",
  similes: ["swap_tokens", "trade_tokens"],
  description: `Swap tokens using Jupiter Exchange.

  Inputs:
  outputMint: string (required)
  inputAmount: number (required)
  inputMint?: string (optional)
  slippageBps?: number (optional)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                outputMint: "So11111111111111111111111111111111111111112",
                inputAmount: 1,
                inputMint: "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa",
                slippageBps: 100,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { transactionId: "5G9f8..." },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const tx = await agent.trade(
      new PublicKey(input.outputMint),
      input.inputAmount,
      input.inputMint ? new PublicKey(input.inputMint) : new PublicKey("So11111111111111111111111111111111111111112"),
      input.slippageBps
    );

    return {
      success: true,
      data: {
        transaction: tx,
        inputAmount: input.inputAmount,
        inputToken: input.inputMint || "SOL",
        outputToken: input.outputMint
      }
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        outputMint: z.string(),
        inputAmount: z.number(),
        inputMint: z.string().optional(),
        slippageBps: z.number().optional()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};