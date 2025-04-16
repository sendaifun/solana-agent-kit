import { runEvals } from "../utils/runEvals";

const UNSTAKE_FROM_DRIFT_INSURANCE_FUND_DATASET = [
  {
    inputs: {
      query: "Unstake from drift insurance fund my USDC after request period"
    },
    referenceOutputs: {
      tool: "unstake_from_drift_insurance_fund",
      response: JSON.stringify("USDC"),
    },
  },
];

runEvals(UNSTAKE_FROM_DRIFT_INSURANCE_FUND_DATASET, "unstake_from_drift_insurance_fund eval");