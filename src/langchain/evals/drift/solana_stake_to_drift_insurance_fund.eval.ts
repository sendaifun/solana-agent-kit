import { runEvals } from "../utils/runEvals";

const STAKE_TO_DRIFT_INSURANCE_FUND_DATASET = [
  {
    inputs: {
      query: "Stake 10 USDC to the drift insurance fund"
    },
    referenceOutputs: {
      tool: "stake_to_drift_insurance_fund",
      response: JSON.stringify({
        amount: 10,
        symbol: "USDC"
      }),
    },
  },
];

runEvals(STAKE_TO_DRIFT_INSURANCE_FUND_DATASET, "stake_to_drift_insurance_fund eval");