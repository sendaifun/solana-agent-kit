import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaTokenDataAction: Action = {
  name: "solana_token_data",
  similes: ["get_token_data", "fetch_token_data"],
  description: `Get the token data for a given token mint address.

  Inputs:
  mintAddress: string, eg "So11111111111111111111111111111111111111112" (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                mintAddress: "So11111111111111111111111111111111111111112"
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            name: "Example Token",
            symbol: "EXT",
            decimals: 9,
            supply: "1000000000"
          },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const tokenData = await agent.getTokenDataByAddress(input.mintAddress.trim());
    return {
      success: true,
      data: {
        tokenData
      }
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        mintAddress: z.string()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
