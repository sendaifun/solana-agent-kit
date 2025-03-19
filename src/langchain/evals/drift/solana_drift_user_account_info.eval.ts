import { runEvals } from "../utils/runEvals";

const DRIFT_USER_ACCOUNT_INFO_DATASET = [
  {
    inputs: {
      query: "What's my drift user account info?"
    },
    referenceOutputs: {
      tool: "drift_user_account_info",
      response: "{}",
    },
  },
];

runEvals(DRIFT_USER_ACCOUNT_INFO_DATASET, "solana_drift_user_account_info eval");