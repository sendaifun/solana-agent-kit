import { runEvals } from "../utils/runEvals";

const CANCEL_ALL_ORDERS_DATASET = [
  {
    inputs: {
      query: "Cancel all my open orders on the SOL/USDC manifest market with id ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ"
    },
    referenceOutputs: {
      tool: "solana_cancel_all_orders",
      response: JSON.stringify("ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ"),
    },
  },
];

runEvals(CANCEL_ALL_ORDERS_DATASET, "solana_cancel_all_orders eval");