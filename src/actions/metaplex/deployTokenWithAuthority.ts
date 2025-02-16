import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { deploy_token_with_authority } from "../../tools";

const deployTokenWithAuthorityAction: Action = {
  name: "DEPLOY_TOKEN_WITH_AUTHORITY",
  similes: [
    "create token with authority",
    "launch token with authority",
    "deploy new token with authority",
    "create new token with authority",
    "mint token with authority",
  ],
  description:
    "Deploy a new SPL token on the Solana blockchain with specified parameters and authority",

  examples: [
    [
      {
        input: {
          name: "My Token",
          uri: "https://example.com/token.json",
          symbol: "MTK",
          decimals: 9,
          authority: {
            mintability: undefined,
            freezability: undefined,
            updateAuthority: undefined,
            isMutable: true,
          },
          initialSupply: 1000000,
        },
        output: {
          mint: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          status: "success",
          message: "Token deployed with authority successfully",
        },
        explanation:
          "Deploy a token with initial supply and metadata including authority",
      },
    ],
    [
      {
        input: {
          name: "Basic Token",
          uri: "https://example.com/basic.json",
          symbol: "BASIC",
          authority: {},
        },
        output: {
          mint: "8nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkM",
          status: "success",
          message: "Token deployed with authority successfully",
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
    authority: z.object({
      mintability: z.boolean().optional(),
      freezability: z.boolean().optional(),
      updateAuthority: z.boolean().optional(),
      isMutable: z.boolean().optional(),
    }),
    initialSupply: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await deploy_token_with_authority(
        agent,
        input.name,
        input.uri,
        input.symbol,
        input.decimals,
        input.authority,
        input.initialSupply,
      );

      return {
        mint: result.mint.toString(),
        status: "success",
        message: "Token deployed with authority successfully",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Token deployment failed: ${error.message}`,
      };
    }
  },
};

export default deployTokenWithAuthorityAction;
