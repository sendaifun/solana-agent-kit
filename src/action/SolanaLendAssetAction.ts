import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaLendAssetAction: Action = {
  name: "solana_lend_asset",
  similes: ["lend_asset", "provide_liquidity"],
  description: `Lend idle USDC for yield using Lulo. (only USDC is supported)

  Inputs:
  amount: number, eg 1, 0.01 (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                amount: 100,
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
    const tx = await agent.lendAssets(input.amount);
    return {
      success: true,
      data: {
        transaction: tx,
        amount: input.amount,
      },
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        amount: z.number().positive(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
