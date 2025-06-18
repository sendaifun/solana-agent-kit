import { SolanaAgentKit } from "solana-agent-kit";
import { magicedenClient } from "../constants";

interface CollectionStatsResponse {
  symbol: string;
  floorPrice: number;
  listedCount: number;
  avgPrice24hr: number;
  volumeAll: number;
}

/**
 * Get the stats for a collection given its symbol.
 * @param agent SolanaAgentKit instance
 * @param symbol The symbol of the collection to fetch stats for
 * @param options Optional parameters for time window and listing aggregation mode
 * @returns Collection stats including floor price, listed count, average price, and total volume
 */
export async function get_magiceden_collection_stats(
  agent: SolanaAgentKit,
  symbol: string,
  options?: {
    timeWindow?: "24h" | "7d" | "30d" | "all";
    listingAggMode?: boolean;
  },
) {
  try {
    const res = await magicedenClient.get<CollectionStatsResponse>(
      `/collections/${symbol}/stats`,
      {
        headers: agent.config.MAGIC_EDEN_API_KEY
          ? {
              Authorization: `Bearer ${agent.config.MAGIC_EDEN_API_KEY}`,
            }
          : {},
        params: {
          timeWindow: options?.timeWindow || "24h",
          listingAggMode: options?.listingAggMode || false,
        },
      },
    );

    return res.data;
  } catch (e: any) {
    throw new Error(
      `Failed to get collection stats for ${symbol}: ${e.message}`,
    );
  }
}
