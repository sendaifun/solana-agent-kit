import { runEvals } from "../utils/runEvals";

const DOES_USER_HAVE_DRIFT_ACCOUNT_DATASET = [
  {
    inputs: {
      query: "Check if I have a drift account"
    },
    referenceOutputs: {
      tool: "does_user_have_drift_account",
      response: "{}",
    },
  },
];

runEvals(DOES_USER_HAVE_DRIFT_ACCOUNT_DATASET, "does_user_have_drift_account eval");