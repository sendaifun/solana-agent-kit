import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { deploy_token2022 } from "../../tools";

const deployToken2022Action: Action = {
  name: "DEPLOY_TOKEN2022",
  similes: [
    "create token2022",
    "launch token2022",
    "deploy new token2022",
    "create new token2022",
    "mint token2022",
    "create token extension",
    "launch token extension",
    "deploy new token extension",
    "create new token extension",
    "mint token extension",
  ],
  description:
    "Deploy a new SPL token 2022 on the Solana blockchain with specified parameters",
  examples: [
    [
      {
        input: {
          name: "My Token 2022",
          uri: "https://example.com/token-2022.json",
          symbol: "MTK22",
          decimals: 9,
          initialSupply: 1000000,
        },
        output: {
          mint: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          status: "success",
          message: "Token 2022 deployed successfully",
        },
        explanation: "Deploy a token 2022 with initial supply and metadata",
      },
    ],
    [
      {
        input: {
          name: "Basic Token 2022",
          uri: "https://example.com/basic-2022.json",
          symbol: "BASIC22",
        },
        output: {
          mint: "8nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkM",
          status: "success",
          message: "Token 2022 deployed successfully",
        },
        explanation: "Deploy a basic token 2022 with minimal parameters",
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
        message: "Token 2022 deployed successfully",
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
