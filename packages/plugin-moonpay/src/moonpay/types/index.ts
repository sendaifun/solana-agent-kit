export interface MoonPayBuyQuote {
  baseCurrencyAmount: number;
  quoteCurrencyAmount: number;
  feeAmount: number;
  extraFeeAmount: number;
  networkFeeAmount: number;
  totalAmount: number;
}

export interface MoonPayTransaction {
  id: string;
  status: string;
  cryptoTransactionId?: string;
  walletAddress: string;
  baseCurrencyAmount: number;
  quoteCurrencyAmount: number;
  currency: { code: string };
  baseCurrency: { code: string };
  createdAt: string;
  updatedAt: string;
  redirectUrl?: string;
}

export interface MoonPaySellQuote {
  baseCurrencyAmount: number;
  quoteCurrencyAmount: number;
  feeAmount: number;
  extraFeeAmount: number;
  networkFeeAmount: number;
  totalAmount: number;
}
