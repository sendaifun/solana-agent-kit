import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { Action } from "../../types";

const createRealmAction: Action = {
  name: "SPL_CREATE_REALM",
  similes: [
    "create dao realm",
    "initialize governance realm",
    "setup dao",
    "create governance entity",
    "establish dao space",
    "initialize dao organization",
  ],
  description:
    "Create a new DAO realm with specified configuration for on-chain governance",
  examples: [
    [
      {
        input: {
          name: "My Community DAO",
          communityMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          minCommunityTokens: 1000,
          councilMint: "So11111111111111111111111111111111111111112",
        },
        output: {
          status: "success",
          realmAddress: "7nxQB...",
          message: "Successfully created DAO realm",
        },
        explanation:
          "Create a new DAO realm with community and council tokens for governance",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(1).describe("Name of the DAO realm"),
    communityMint: z
      .string()
      .min(1)
      .describe("Address of the community token mint"),
    minCommunityTokens: z
      .number()
      .positive()
      .describe("Minimum community tokens required to create governance"),
    councilMint: z
      .string()
      .optional()
      .describe("Optional address of the council token mint"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await agent.createRealm({
        name: input.name,
        communityMint: new PublicKey(input.communityMint),
        minCommunityTokensToCreateGovernance: input.minCommunityTokens,
        councilMint: input.councilMint
          ? new PublicKey(input.councilMint)
          : undefined,
      });

      return {
        status: "success",
        realmAddress: result.toString(),
        message: `Successfully created realm: ${input.name}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create realm: ${error.message}`,
      };
    }
  },
};

export default createRealmAction;