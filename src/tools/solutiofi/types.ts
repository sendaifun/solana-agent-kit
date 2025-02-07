export interface InputAssetStruct {
  /** The mint address of the asset. */
  mint: string;
  /** The input amount for the transaction. */
  inputAmount: string;
  /** The slippage tolerance for the transaction. */
  slippage: string;
  /** Whether to allow only direct routes for swap. */
  onlyDirectRoutes: boolean;
}

/** Represents target token data for transactions. */
export interface TargetTokenStruct {
  /** The mint address of the token. */
  mint: string;
  /** The percentage allocation for the token (1-100%). */
  percentage: number;
}

export type PriorityFee = "fast" | "turbo" | "ultra";

export type AssetType = "assets" | "accounts" | "nfts";
