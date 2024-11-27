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

export interface PumpFunTokenOptions {
  description?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  imageUrl?: string;
  initialLiquiditySOL?: any;
  slippageBps?: number;
  priorityFee?: number;
  mintAddress?: string; // Optional mint address
}

export interface PumpfunLaunchResponse {
  signature: string;
  mint: string;
  metadataUri?: string;
  error?: string;
}
