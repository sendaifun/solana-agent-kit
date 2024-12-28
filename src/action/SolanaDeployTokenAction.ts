import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaDeployTokenAction: Action = {
  name: "solana_deploy_token",
  similes: ["create_token", "deploy_token"],
  description: `Deploy a new token on Solana blockchain.

  Inputs:
  name: string, eg "My Token" (required)
  uri: string, eg "https://example.com/token.json" (required)
  symbol: string, eg "MTK" (required)
  decimals?: number, eg 9 (optional, defaults to 9)
  initialSupply?: number, eg 1000000 (optional)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                name: "MyToken",
                symbol: "MTK",
                decimals: 9,
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
    const result = await agent.deployToken(
      input.name,
      input.uri,
      input.symbol,
      input.decimals,
      input.initialSupply
    );
    return {
      success: true,
      data: {
        mintAddress: result.mint.toString(),
        decimals: input.decimals || 9,
      },
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        name: z.string(),
        uri: z.string(),
        symbol: z.string(),
        decimals: z.number().optional(),
        initialSupply: z.number().optional()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
