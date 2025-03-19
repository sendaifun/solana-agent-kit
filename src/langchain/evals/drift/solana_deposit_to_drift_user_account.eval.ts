import { runEvals } from "../utils/runEvals";

const DEPOSIT_DRIFT_USER_ACCOUNT_DATASET = [
  {
    inputs: {
      query: "Deposit 5.5 USDC into my drift user account"
    },
    referenceOutputs: {
      tool: "deposit_to_drift_user_account",
      response: JSON.stringify({
        amount: 5.5,
        symbol: "USDC"
      }),
    },
  },
  {
    inputs: {
      query: "Deposit 0.25 SOL into my drift user account, repaying any borrowed"
    },
    referenceOutputs: {
      tool: "deposit_to_drift_user_account",
      response: JSON.stringify({
        amount: 0.25,
        symbol: "SOL",
        repay: true
      }),
    },
  },
];

runEvals(DEPOSIT_DRIFT_USER_ACCOUNT_DATASET, "solana_deposit_to_drift_user_account eval");