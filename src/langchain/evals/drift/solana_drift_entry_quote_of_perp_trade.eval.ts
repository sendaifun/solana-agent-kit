import { runEvals } from "../utils/runEvals";

const DRIFT_ENTRY_QUOTE_OF_PERP_TRADE_DATASET = [
  {
    inputs: {
      query: "What is the entry quote if I long 2 SOL on drift?"
    },
    referenceOutputs: {
      tool: "drift_entry_quote_of_perp_trade",
      response: JSON.stringify({
        amount: 2,
        symbol: "SOL",
        action: "long"
      }),
    },
  },
];

runEvals(DRIFT_ENTRY_QUOTE_OF_PERP_TRADE_DATASET, "drift_entry_quote_of_perp_trade eval");