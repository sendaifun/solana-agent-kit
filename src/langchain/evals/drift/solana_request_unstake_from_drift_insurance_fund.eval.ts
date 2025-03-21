import { runEvals } from "../utils/runEvals";

const REQUEST_UNSTAKE_DRIFT_INSURANCE_FUND_DATASET = [
  {
    inputs: {
      query: "Request to unstake 5 SOL from drift insurance fund"
    },
    referenceOutputs: {
      tool: "request_unstake_from_drift_insurance_fund",
      response: JSON.stringify({
        amount: 5,
        symbol: "SOL"
      }),
    },
  },
];

runEvals(REQUEST_UNSTAKE_DRIFT_INSURANCE_FUND_DATASET, "request_unstake_from_drift_insurance_fund eval");