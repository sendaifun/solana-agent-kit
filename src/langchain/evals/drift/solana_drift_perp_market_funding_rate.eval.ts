import { runEvals } from "../utils/runEvals";

const DRIFT_PERP_MARKET_FUNDING_RATE_DATASET = [
  {
    inputs: {
      query: "Get the funding rate for SOL perp in hourly terms"
    },
    referenceOutputs: {
      tool: "drift_perp_market_funding_rate",
      response: JSON.stringify({
        symbol: "SOL",
        period: "hour"
      }),
    },
  },
  {
    inputs: {
      query: "What's the annual funding rate for BTC perp on drift?"
    },
    referenceOutputs: {
      tool: "drift_perp_market_funding_rate",
      response: JSON.stringify({
        symbol: "BTC",
        period: "year"
      }),
    },
  },
];

runEvals(DRIFT_PERP_MARKET_FUNDING_RATE_DATASET, "drift_perp_market_funding_rate eval");