export interface OrbitPoolInfo {
  id: string;
  priceUsd: number;
  activeBinId: number;
  binStep: number;
  feeRateBps: number;
  tvlUsd: number;
  volume24hUsd: number;
  tokenX: { mint: string; symbol: string; decimals: number };
  tokenY: { mint: string; symbol: string; decimals: number };
}

export interface OrbitSwapResult {
  transactionId: string;
  poolId: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
}

export interface OrbitAddLiquidityResult {
  transactionId: string;
  poolId: string;
  lowerBinId: number;
  upperBinId: number;
  amountX: number;
  amountY: number;
  strategy: string;
}

export interface OrbitRemoveLiquidityResult {
  transactionId: string;
  poolId: string;
  positionId: string;
  bpsRemoved: number;
  positionClosed: boolean;
}

export type OrbitLiquidityStrategy =
  | "uniform"
  | "balanced"
  | "concentrated"
  | "skew_bid"
  | "skew_ask"
  | "bid_ask";
