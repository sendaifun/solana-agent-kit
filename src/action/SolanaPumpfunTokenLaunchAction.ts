import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaPumpfunTokenLaunchAction: Action = {
  name: "solana_launch_pumpfun_token",
  similes: ["launch_token", "create_token"],
  description: `Launch a token on Pump.fun.
   Do not use this for creating SPL tokens.

   Inputs:
   tokenName: string, eg "PumpFun Token" (required)
   tokenTicker: string, eg "PUMP" (required)
   description: string, eg "PumpFun Token description" (required)
   imageUrl: string, eg "https://i.imgur.com/UFm07Np_d.png" (required)
   twitter?: string (optional)
   telegram?: string (optional)
   website?: string (optional)
   initialLiquiditySOL?: number (optional)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenName: "PumpfunToken",
                tokenTicker: "PFT",
                description: "Example token",
                imageUrl: "https://example.com/image.png"
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { tokenAddress: "So11111111111111111111111111111111111111112" },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await agent.launchPumpFunToken(
      input.tokenName,
      input.tokenTicker,
      input.description,
      input.imageUrl,
      {
        twitter: input.twitter,
        telegram: input.telegram,
        website: input.website,
        initialLiquiditySOL: input.initialLiquiditySOL,
      }
    );

    return {
      success: true,
      data: {
        tokenName: input.tokenName,
        tokenTicker: input.tokenTicker,
        result
      }
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        tokenName: z.string(),
        tokenTicker: z.string(),
        description: z.string(),
        imageUrl: z.string(),
        twitter: z.string().optional(),
        telegram: z.string().optional(),
        website: z.string().optional(),
        initialLiquiditySOL: z.number().optional()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
