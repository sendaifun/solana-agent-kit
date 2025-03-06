import { PublicKey } from "@solana/web3.js";

export interface Creator {
  address: string;
  percentage: number;
}

export interface CollectionOptions {
  name: string;
  uri: string;
  royaltyBasisPoints?: number;
  creators?: Creator[];
}

// Add return type interface
export interface CollectionDeployment {
  collectionAddress: PublicKey;
  signature: Uint8Array;
}

export interface MintCollectionNFTResponse {
  mint: PublicKey;
  metadata: PublicKey;
}

export interface SPLAuthorityInput {
  mintAuthority?: PublicKey | null;
  freezeAuthority?: PublicKey | null;
  updateAuthority?: PublicKey | null;
  isMutable?: boolean;
}
