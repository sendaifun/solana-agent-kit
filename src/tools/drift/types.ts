import type { L2OrderBook, MarketType, OraclePriceData } from "@drift-labs/sdk";

export type L2WithOracle = L2OrderBook & { oracleData: OraclePriceData };

export type RawL2Output = {
  marketIndex: number;
  marketType: MarketType;
  marketName: string;
  asks: {
    price: string;
    size: string;
    sources: {
      [key: string]: string;
    };
  }[];
  bids: {
    price: string;
    size: string;
    sources: {
      [key: string]: string;
    };
  }[];
  oracleData: {
    price: string;
    slot: string;
    confidence: string;
    hasSufficientNumberOfDataPoints: boolean;
    twap?: string;
    twapConfidence?: string;
    maxPrice?: string;
  };
  slot?: number;
};
