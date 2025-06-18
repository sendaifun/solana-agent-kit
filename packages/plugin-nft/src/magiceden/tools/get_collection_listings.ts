import { SolanaAgentKit } from "solana-agent-kit";
import { magicedenClient } from "../constants";

/**
 * Get the listings for a collection given its symbol.
 * @param agent SolanaAgentKit instance
 * @param symbol The symbol of the collection to fetch listings for
 * @param options Optional parameters for pagination, price range, and sorting
 */
export async function get_magiceden_collection_listings(
  agent: SolanaAgentKit,
  symbol: string,
  options?: {
    limit?: number;
    offset?: number;
    min_price?: number;
    max_price?: number;
    sort?: "updatedAt" | "listPrice";
    sort_direction?: "asc" | "desc";
  },
) {
  try {
    const res = await magicedenClient.get<GetListingsResponse[]>(
      `/collections/${symbol}/listings`,
      {
        headers: agent.config.MAGIC_EDEN_API_KEY
          ? {
              Authorization: `Bearer ${agent.config.MAGIC_EDEN_API_KEY}`,
            }
          : {},
        params: {
          limit: options?.limit || 20,
          offset: options?.offset || 0,
          min_price: options?.min_price || 0,
          max_price: options?.max_price || 10000000000000,
          sort: options?.sort || "listPrice",
          sort_direction: options?.sort_direction || "asc",
        },
      },
    );

    return res.data;
  } catch (e: any) {
    throw new Error(`Failed to get collection listings: `, e.message);
  }
}

interface GetListingsResponse {
  pdaAddress: string;
  auctionHouse: string;
  tokenAddress: string;
  tokenMint: string;
  seller: string;
  sellerReferral: string;
  tokenSize: number;
  price: number;
  rarity: Rarity;
  extra: Extra;
  expiry: number;
  token: Token;
  listingSource: string;
}

interface Extra {
  img: string;
}

interface Rarity {}

interface Token {
  mintAddress: string;
  owner: string;
  supply: number;
  collection: string;
  name: string;
  updateAuthority: string;
  primarySaleHappened: boolean;
  sellerFeeBasisPoints: number;
  image: string;
  animationUrl: string;
  externalUrl: string;
  attributes: Attribute[];
  properties: Properties;
}

interface Attribute {
  trait_type: string;
  value: number | string;
}

interface Properties {
  category: string;
  files: File[];
  creators: Creator[];
}

interface Creator {
  address: string;
  share: number;
}

interface File {
  uri: string;
  type: string;
}
