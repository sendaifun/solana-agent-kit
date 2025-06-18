import { SolanaAgentKit } from "solana-agent-kit";
import { magicedenClient } from "../constants";

interface GetPopularCollectionsResponse {
  symbol: string;
  name: string;
  description: string;
  image: string;
  floorPrice: number;
  volumeAll: number;
  hasCNFTs: boolean;
}

export async function get_magiceden_popular_collections(
  agent: SolanaAgentKit,
  options: { timeRange: "1h" | "1d" | "7d" | "30d" } = { timeRange: "1d" },
) {
  try {
    const res = await magicedenClient.get<GetPopularCollectionsResponse[]>(
      "/marketplace/popular_collections",
      {
        params: {
          timeRange: options.timeRange,
        },
        headers: agent.config.MAGIC_EDEN_API_KEY
          ? {
              Authorization: `Bearer ${agent.config.MAGIC_EDEN_API_KEY}`,
            }
          : {},
      },
    );

    return res.data;
  } catch (e: any) {
    throw new Error(`Failed to get popular collections: ${e.message}`);
  }
}
