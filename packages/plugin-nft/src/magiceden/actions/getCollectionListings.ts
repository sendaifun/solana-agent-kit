import { Action } from "solana-agent-kit";
import { z } from "zod";
import { get_magiceden_collection_listings } from "../tools/get_collection_listings";

const getMagicEdenCollectionListingsAction: Action = {
  name: "GET_MAGICEDEN_COLLECTION_LISTINGS",
  description: "Fetch listings for a specific NFT collection on MagicEden",
  similes: [
    "get collection listings",
    "fetch collection listings",
    "magiceden collection listings",
    "listings for nft collection",
  ],
  examples: [
    [
      {
        input: {
          collectionId: "COLLECTION_ID", // The ID of the NFT collection
          limit: 10, // Optional, number of listings to fetch
        },
        output: {
          status: "success",
          message: "Collection listings fetched successfully",
          listings: [
            {
              tokenMint: "TOKEN_MINT_ADDRESS",
              price: 1.5, // Price in SOL
              seller: "SELLER_ADDRESS",
              listingTime: "2023-10-01T12:00:00Z", // ISO date string
            },
            // More listings...
          ],
        },
        explanation:
          "Fetch the first 10 listings for a specific NFT collection on MagicEden.",
      },
    ],
  ],
  schema: z.object({
    collectionSymbol: z.string().min(1, "Collection symbol is required"),
    limit: z.number().int().min(1).max(100).optional(),
  }),
  handler: async (agent, input) => {
    const { collectionSymbol, limit = 10 } = input;

    try {
      const res = await get_magiceden_collection_listings(
        agent,
        collectionSymbol,
        { limit },
      );

      return {
        status: "success",
        message: "Collection listings fetched successfully",
        listings: res,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch collection listings: ${error.message}`,
      };
    }
  },
};

export default getMagicEdenCollectionListingsAction;
