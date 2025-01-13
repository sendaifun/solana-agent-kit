import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { deploy_collection } from "../../tools/metaplex";

interface CollectionOptions {
  name: string;
  uri: string;
  royaltyBasisPoints?: number;
}

const deployCollectionAction: Action = {
  name: "DEPLOY_COLLECTION",
  similes: [
    "create collection",
    "launch collection",
    "deploy nft collection",
    "create nft collection",
    "mint collection",
  ],
  description: `Deploy a new NFT collection on Solana blockchain.`,
  examples: [
    [
      {
        input: {
          name: "My Collection",
          uri: "https://example.com/collection.json",
          royaltyBasisPoints: 500,
        },
        output: {
          status: "success",
          message: "Collection deployed successfully",
          collectionAddress: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          name: "My Collection",
        },
        explanation: "Deploy an NFT collection with 5% royalty",
      },
    ],
    [
      {
        input: {
          name: "Basic Collection",
          uri: "https://example.com/basic.json",
        },
        output: {
          status: "success",
          message: "Collection deployed successfully",
          collectionAddress: "8nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkM",
          name: "Basic Collection",
        },
        explanation: "Deploy a basic NFT collection without royalties",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(1, "Name is required"),
    uri: z.string().url("URI must be a valid URL"),
    royaltyBasisPoints: z.number().min(0).max(10000).optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const options: CollectionOptions = {
      name: input.name,
      uri: input.uri,
      royaltyBasisPoints: input.royaltyBasisPoints,
    };

    const result = await deploy_collection(agent, options);

    return {
      status: "success",
      message: "Collection deployed successfully",
      collectionAddress: result.collectionAddress.toString(),
      name: input.name,
    };
  },
};

export default deployCollectionAction;
