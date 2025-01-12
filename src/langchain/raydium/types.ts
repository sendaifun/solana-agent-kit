export interface RaydiumAmmV4Input {
  marketId: string;
  baseAmount: number | string;
  quoteAmount: number | string;
  startTime: number;
}

export interface RaydiumClmmInput {
  mint1: string;
  mint2: string;
  configId: string;
  initialPrice: number | string;
  startTime: number;
}

export interface RaydiumCpmmInput {
  mint1: string;
  mint2: string;
  configId: string;
  mintAAmount: number | string;
  mintBAmount: number | string;
  startTime: number;
}
