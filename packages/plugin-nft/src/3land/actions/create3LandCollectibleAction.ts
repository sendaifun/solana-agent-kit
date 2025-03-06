import type { Action } from "solana-agent-kit";
import { z } from "zod";
import {
  createCollection,
  createSingle,
} from "../tools/create_3land_collectible";
import type {
  CreateCollectionOptions,
  CreateSingleOptions,
} from "@3land/listings-sdk/dist/types/implementation/implementationTypes";

const create3LandCollectibleAction: Action = {
  name: "CREATE_3LAND_COLLECTIBLE",
  similes: [
    "create 3land collectible",
    "mint 3land collectible",
    "deploy 3land collectible",
    "create 3land nft",
    "mint on 3land",
  ],
  description: "Create a new collection or single NFT on 3Land marketplace",
  examples: [
    [
      {
        input: {
          isCollection: true,
          name: "My 3Land Collection",
          symbol: "M3LC",
          description: "A beautiful collection of digital art",
          image: "https://example.com/collection-image.png",
          isMainnet: false,
        },
        output: {
          status: "success",
          message: "Collection created successfully on 3Land",
          collectionAccount: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
        },
        explanation: "Create a new NFT collection on 3Land devnet",
      },
    ],
    [
      {
        input: {
          isCollection: false,
          name: "My 3Land NFT",
          symbol: "M3LN",
          description: "A unique digital artwork",
          image: "https://example.com/nft-image.png",
          collectionAccount: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          price: 1.5,
          sellerFeeBasisPoints: 500,
          isMainnet: false,
          withPool: false,
        },
        output: {
          status: "success",
          message: "Single NFT created and listed successfully on 3Land",
          nftAddress: "8nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkM",
        },
        explanation:
          "Create and list a single NFT on 3Land devnet with 5% royalties",
      },
    ],
  ],
  schema: z.object({
    isCollection: z
      .boolean()
      .describe("Whether to create a collection or single NFT"),
    name: z.string().min(1, "Name is required"),
    symbol: z.string().min(1, "Symbol is required"),
    description: z.string().min(1, "Description is required"),
    image: z.string().url("Image must be a valid URL"),
    isMainnet: z.boolean().optional().default(false),
    traits: z.array(z.string()),
    // Collection-specific fields
    collectionAccount: z.string().optional(),
    // Single NFT-specific fields
    price: z.number().positive().optional(),
    sellerFeeBasisPoints: z.number().min(0).max(10000).optional(),
    withPool: z.boolean().optional().default(false),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      if (input.isCollection) {
        const collectionOpts: CreateCollectionOptions = {
          collectionName: input.name,
          collectionSymbol: input.symbol,
          collectionDescription: input.description,
          mainImageUrl: input.image,
        };

        const result = await createCollection({}, collectionOpts);

        return {
          status: "success",
          message: "Collection created successfully on 3Land",
          collectionAccount: result.toString(),
        };
      }
      if (!input.collectionAccount) {
        throw new Error(
          "Collection account is required for single NFT creation",
        );
      }

      const createItemOptions: CreateSingleOptions = {
        traits: input.traits,
        itemName: input.name,
        itemSymbol: input.symbol,
        itemDescription: input.description,
        mainImageUrl: input.image,
        sellerFee: input.sellerFeeBasisPoints || 0,
        price: input.price || 0,
        itemAmount: 1,
      };

      const result = await createSingle(
        {},
        input.collectionAccount,
        createItemOptions,
        input.isMainnet,
        input.withPool,
      );

      return {
        status: "success",
        message: "Single NFT created and listed successfully on 3Land",
        nftAddress: result.payerPublicKey,
        transaction: result.transactionId,
      };
    } catch (error) {
      return {
        status: "error",
        // @ts-expect-error - error is an object
        message: `Failed to create 3Land collectible: ${error.message}`,
      };
    }
  },
};

export default create3LandCollectibleAction;
