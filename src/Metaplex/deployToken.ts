import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { deploy_token } from "../tools";

const deployTokenAction: Action = {
  name: "DEPLOY_TOKEN",
  similes: [
    "create token",
    "launch token",
    "deploy new token",
    "create new token",
    "mint token",
  ],
  description:
    "Deploy a new SPL token on the Solana blockchain with specified parameters",
  examples: [
    [
      {
        input: {
          name: "My Token",
          uri: "https://example.com/token.json",
          symbol: "MTK",
          decimals: 9,
          initialSupply: 1000000,
        },
        output: {
          mint: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          status: "success",
          message: "Token deployed successfully",
        },
        explanation: "Deploy a token with initial supply and metadata",
      },
    ],
    [
      {
        input: {
          name: "Basic Token",
          uri: "https://example.com/basic.json",
          symbol: "BASIC",
        },
        output: {
          mint: "8nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkM",
          status: "success",
          message: "Token deployed successfully",
        },
        explanation: "Deploy a basic token with minimal parameters",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(1, "Name is required"),
    uri: z.string().url("URI must be a valid URL"),
    symbol: z.string().min(1, "Symbol is required"),
    decimals: z.number().optional(),
    initialSupply: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await deploy_token(
        agent,
        input.name,
        input.uri,
        input.symbol,
        input.decimals,
        input.initialSupply,
      );

      return {
        mint: result.mint.toString(),
        status: "success",
        message: "Token deployed successfully",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Token deployment failed: ${error.message}`,
      };
    }
  },
};

export default deployTokenAction;
