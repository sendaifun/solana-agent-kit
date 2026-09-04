import { PublicKey } from "@solana/web3.js";

/**
 * Common token addresses used across the toolkit
 */
export const TOKENS = {
  SEND: new PublicKey("SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa"),
  USDC: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  SOL: new PublicKey("So11111111111111111111111111111111111111112"),
} as const;

/**
 * Default configuration options
 * @property {number} SLIPPAGE_BPS - Default slippage tolerance in basis points (300 = 3%)
 * @property {number} TOKEN_DECIMALS - Default number of decimals for new tokens
 * @property {number} LEVERAGE_BPS - Default leverage for trading PERP
 */
export const DEFAULT_OPTIONS = {
  SLIPPAGE_BPS: 300,
  TOKEN_DECIMALS: 9,
  RERERRAL_FEE: 200,
  LEVERAGE_BPS: 50000, // 10000 = x1, 50000 = x5, 100000 = x10, 1000000 = x100
} as const;

/**
 * Jupiter API URLs.
 *
 * `quote-api.jup.ag` and `tokens.jup.ag` were retired and no longer resolve;
 * the free-tier equivalents live under `lite-api.jup.ag`. Swap the host for
 * `https://api.jup.ag` if you have a Jupiter API key.
 */
export const JUP_API = "https://lite-api.jup.ag/swap/v1";
export const JUP_PRICE_API = "https://lite-api.jup.ag/price/v3";
export const JUP_TOKEN_API = "https://lite-api.jup.ag/tokens/v2";
export const JUP_REFERRAL_ADDRESS =
  "REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3";

export const METEORA_DYNAMIC_AMM_PROGRAM_ID = new PublicKey(
  "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB",
);
export const METEORA_DLMM_PROGRAM_ID = new PublicKey(
  "LbVRzDTvBDEcrthxfZ4RL6yiq3uZw8bS6MwtdY6UhFQ",
);
