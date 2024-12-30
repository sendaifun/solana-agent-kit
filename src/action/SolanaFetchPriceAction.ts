import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaFetchPriceAction: Action = {
  name: "solana_fetch_price",
  similes: ["get_price", "fetch_token_price"],
  description: `Fetch the price of a given token in USDC.

  Inputs:
  tokenId: string, the mint address of the token (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tokenId: "So11111111111111111111111111111111111111112"
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { price: 150.25 },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const price = await agent.fetchTokenPrice(input.tokenId.trim());
    return {
      success: true,
      data: {
        tokenId: input.tokenId,
        priceInUSDC: price,
      }
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        tokenId: z.string()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
