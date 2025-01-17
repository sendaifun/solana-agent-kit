import { PublicKey } from "@solana/web3.js";

export interface FluxBeamSwapQuote {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippage?: number;
}

export interface FluxBeamSwapRequest {
  quote: FluxBeamSwapQuote;
  userPublicKey: string;
}

export interface FluxBeamLiquidityRequest {
  tokenA: string;
  tokenB: string;
  amountA: number;
  amountB: number;
  slippage?: number;
  userPublicKey: string;
}

export interface FluxBeamPoolInfo {
  tokenA: string;
  tokenB: string;
  liquidity: number;
  fee: number;
  apr?: number;
}

export interface FluxBeamResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}