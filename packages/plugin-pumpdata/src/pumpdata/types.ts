/**
 * Base URL of the pumpdata.fun API.
 */
export const PUMPDATA_BASE_URL = "https://pumpdata.fun";

/**
 * CAIP-2 id of Solana mainnet, the only network pumpdata.fun takes payment on.
 */
export const SOLANA_MAINNET_CAIP2 = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

/**
 * USDC on Solana mainnet, the asset pumpdata.fun is paid in.
 */
export const USDC_MAINNET_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

/**
 * The listed price of each paid call, in USD (paid in USDC).
 * The plugin never pays more than this for the call, whatever a 402 asks.
 * Source: https://pumpdata.fun/llms.txt and https://pumpdata.fun/openapi.json
 */
export const PUMPDATA_PRICES_USD = {
  launch: 0.005,
  wallets: 0.01,
  deployer: 0.005,
  similar: 0.005,
  baserate: 0.005,
} as const;

export type PumpDataPaidCall = keyof typeof PUMPDATA_PRICES_USD;

/**
 * The settlement receipt pumpdata.fun returns in the PAYMENT-RESPONSE header.
 */
export interface PumpDataPaymentReceipt {
  success: boolean;
  /** Signature of the USDC transfer that paid for the call */
  transaction?: string;
  network?: string;
  payer?: string;
}

/**
 * One answer from pumpdata.fun, with the headers that date it.
 */
export interface PumpDataResponse<T = Record<string, any>> {
  /** The JSON body of the answer */
  data: T;
  /** X-Data-From: where the data behind this answer begins */
  dataFrom?: string;
  /** X-Data-As-Of: the build this answer comes from */
  dataAsOf?: string;
  /** Present when the call was paid over x402 */
  payment?: PumpDataPaymentReceipt;
  /** USD price of the call (0 for the free calls) */
  priceUsd: number;
}

export type PumpDataVenue = "any" | "curve" | "pool";

export interface PumpDataBaseRateParams {
  /** Market cap band in USD, such as "15k-28k" */
  band: string;
  /** ISO 8601 start of the window */
  from: string;
  /** ISO 8601 end of the window, at most 31 days after `from` */
  to: string;
  /** Where the crossing happened: bonding curve, pool, or either */
  venue?: PumpDataVenue;
}
