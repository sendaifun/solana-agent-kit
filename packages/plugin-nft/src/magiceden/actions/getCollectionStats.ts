import { Action } from "solana-agent-kit";
import { z } from "zod";
import { get_magiceden_collection_stats } from "../tools/get_collection_stats";

const getMagicEdenCollectionStatsAction: Action = {
  name: "GET_MAGICEDEN_COLLECTION_STATS",
  description: "Fetch statistics for a specific NFT collection on MagicEden",
  similes: [
    "get collection stats",
    "fetch collection stats",
    "magiceden collection stats",
    "collection statistics",
  ],
  examples: [
    [
      {
        input: {
          collectionId: "COLLECTION_ID", // The ID of the NFT collection
        },
        output: {
          status: "success",
          message: "Collection stats fetched successfully",
          stats: {
            totalSupply: 1000,
            floorPrice: 2.5, // Price in SOL
            averagePrice: 3.0, // Price in SOL
            totalVolume: 5000, // Total volume in SOL
          },
        },
        explanation:
          "Fetch statistics for a specific NFT collection on MagicEden.",
      },
    ],
  ],
  schema: z.object({
    collectionSymbol: z.string().min(1, "Collection ID is required"),
    timeWindow: z.enum(["24h", "7d", "30d"]).optional().default("24h"),
  }),
  handler: async (agent, input) => {
    const { collectionSymbol, timeWindow } = input;

    try {
      const res = await get_magiceden_collection_stats(
        agent,
        collectionSymbol,
        {
          timeWindow: timeWindow as "24h" | "7d" | "30d" | "all",
        },
      );

      return {
        status: "success",
        message: "Collection stats fetched successfully",
        stats: res,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch collection stats: ${error.message}`,
      };
    }
  },
};

export default getMagicEdenCollectionStatsAction;
