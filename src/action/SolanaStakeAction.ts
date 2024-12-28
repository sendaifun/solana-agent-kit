import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaStakeAction: Action = {
  name: "solana_stake",
  similes: ["stake_tokens", "delegate_tokens"],
  description: `Stake your SOL (Solana), also called as SOL staking or liquid staking.

  Inputs:
  amount: number, eg 1 or 0.01 (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                amount: 1
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
    const tx = await agent.stake(input.amount);
    return {
      success: true,
      data: {
        transaction: tx,
        amount: input.amount
      }
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        amount: z.number().positive()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
