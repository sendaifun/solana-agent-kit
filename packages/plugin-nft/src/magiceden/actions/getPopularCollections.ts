import { Action } from "solana-agent-kit";
import { get_magiceden_popular_collections } from "../tools/get_popular_collections";
import { z } from "zod";

const getPopularMagicEdenCollections: Action = {
  name: "GET_POPULAR_MAGICEDEN_COLLECTIONS",
  description: "Fetch popular NFT collections from MagicEden",
  similes: [
    "get popular collections",
    "fetch popular nft collections",
    "magiceden popular collections",
    "popular nft collections",
  ],
  examples: [
    [
      {
        input: {
          timeRange: "1d", // Options: "1h", "1d", "7d", "30d"
        },
        output: {
          status: "success",
          message: "Popular collections fetched successfully",
          collections: [
            {
              symbol: "COLLECTION_SYMBOL",
              name: "Collection Name",
              description: "Collection Description",
              image: "https://example.com/image.png",
              floorPrice: 2.5,
              volumeAll: 1000,
              hasCNFTs: false,
            },
            // More collections...
          ],
        },
        explanation:
          "Fetch popular NFT collections from MagicEden for the last day.",
      },
    ],
  ],
  schema: z.object({
    timeRange: z.enum(["1h", "1d", "7d", "30d"]).optional().default("1d"),
  }),
  handler: async (agent, input) => {
    const { timeRange } = input;

    try {
      const res = await get_magiceden_popular_collections(agent, {
        timeRange,
      });

      return {
        status: "success",
        message: "Popular collections fetched successfully",
        collections: res,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch popular collections: ${error.message}`,
      };
    }
  },
};

export default getPopularMagicEdenCollections;
