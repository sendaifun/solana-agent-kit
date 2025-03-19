import { runEvals } from "../utils/runEvals";

const CREATE_DRIFT_USER_ACCOUNT_DATASET = [
  {
    inputs: {
      query: "Create my drift user account, deposit 10 USDC"
    },
    referenceOutputs: {
      tool: "create_drift_user_account",
      response: JSON.stringify({
        amount: 10,
        symbol: "USDC"
      }),
    },
  },
];

runEvals(CREATE_DRIFT_USER_ACCOUNT_DATASET, "solana_create_drift_user_account eval");