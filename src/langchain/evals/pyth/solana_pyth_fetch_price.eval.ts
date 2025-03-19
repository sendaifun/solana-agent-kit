import { runEvals } from "../utils/runEvals";

const PYTH_FETCH_PRICE_DATASET = [
  {
    inputs: {
      query: "What's the current price of SOL from Pyth?",
    },
    referenceOutputs: {
      tool: "solana_pyth_fetch_price",
      response: "SOL",
    },
  },
  {
    inputs: {
      query: "Fetch the Pyth price for BTC",
    },
    referenceOutputs: {
      tool: "solana_pyth_fetch_price",
      response: "BTC",
    },
  },
];

runEvals(PYTH_FETCH_PRICE_DATASET, "solana_pyth_fetch_price eval");