import { runEvals } from "../utils/runEvals";

const TRADE_DRIFT_PERP_ACCOUNT_DATASET = [
  {
    inputs: {
      query: "Go short 1.5 BTC on drift with limit order at price=30000"
    },
    referenceOutputs: {
      tool: "trade_drift_perp_account",
      response: JSON.stringify({
        amount: 1.5,
        symbol: "BTC",
        action: "short",
        type: "limit",
        price: 30000
      }),
    },
  },
  {
    inputs: {
      query: "Open a market long of 2 ETH on drift"
    },
    referenceOutputs: {
      tool: "trade_drift_perp_account",
      response: JSON.stringify({
        amount: 2,
        symbol: "ETH",
        action: "long",
        type: "market"
      }),
    },
  },
];

runEvals(TRADE_DRIFT_PERP_ACCOUNT_DATASET, "trade_drift_perp_account eval");