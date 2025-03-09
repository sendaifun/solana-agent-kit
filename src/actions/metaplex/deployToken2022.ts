import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { deploy_token2022 } from "../../tools";

const deployToken2022Action: Action = {
  name: "DEPLOY_TOKEN_2022",
  similes: [
    "create token2022",
    "launch token2022",
    "deploy new token2022",
    "create new token2022",
    "mint token2022",
  ],
  description:
    "Deploy a new SPL token2022 on the Solana blockchain with specified parameters",
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
        explanation: "Deploy a token2022 with initial supply and metadata",
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
        explanation: "Deploy a basic token2022 with minimal parameters",
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
      const result = await deploy_token2022(
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

export default deployToken2022Action;
