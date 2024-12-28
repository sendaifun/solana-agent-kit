import { SolanaAgentKit } from "../agent";
import { Action, CollectionOptions } from "../types";
import { z } from "zod";

export const SolanaDeployCollectionAction: Action = {
  name: "solana_deploy_collection",
  similes: ["create_collection", "deploy_collection"],
  description: `Deploy a new NFT collection on Solana blockchain.

  Inputs:
  name: string, eg "My Collection" (required)
  uri: string, eg "https://example.com/collection.json" (required)
  royaltyBasisPoints?: number, eg 500 for 5% (optional)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                name: "MyCollection",
                symbol: "MC",
                uri: "https://example.com/metadata.json",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            collectionAddress: "So11111111111111111111111111111111111111112",
          },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const payload: CollectionOptions = {
      name: input.name,
      uri: input.uri,
      royaltyBasisPoints: input.royaltyBasisPoints,
    };
    const result = await agent.deployCollection(payload);
    return {
      success: true,
      data: {
        collectionAddress: result.collectionAddress.toString(),
        name: input.name,
      },
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        name: z.string(),
        symbol: z.string(),
        uri: z.string(),
        royaltyBasisPoints: z.number().optional()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
