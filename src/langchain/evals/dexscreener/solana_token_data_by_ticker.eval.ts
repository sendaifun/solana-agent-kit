import { runEvals } from "../utils/runEvals";

const TOKEN_DATA_BY_TICKER_DATASET = [
  {
    inputs: {
      query: "Get info for ticker 'BONK' from DexScreener"
    },
    referenceOutputs: {
      tool: "solana_token_data_by_ticker",
      response: "BONK",
    },
  },
  {
    inputs: {
      query: "Show details about the USDC ticker"
    },
    referenceOutputs: {
      tool: "solana_token_data_by_ticker",
      response: "USDC",
    },
  },
];

runEvals(TOKEN_DATA_BY_TICKER_DATASET, "solana_token_data_by_ticker eval");