import { runEvals } from "../utils/runEvals";

const WITHDRAW_FROM_DRIFT_ACCOUNT_DATASET = [
  {
    inputs: {
      query: "Withdraw 2 SOL from my drift account"
    },
    referenceOutputs: {
      tool: "withdraw_from_drift_account",
      response: JSON.stringify({
        amount: 2,
        symbol: "SOL"
      }),
    },
  },
  {
    inputs: {
      query: "Borrow 100 USDC from my drift account"
    },
    referenceOutputs: {
      tool: "withdraw_from_drift_account",
      response: JSON.stringify({
        amount: 100,
        symbol: "USDC",
        isBorrow: true
      }),
    },
  },
];

runEvals(WITHDRAW_FROM_DRIFT_ACCOUNT_DATASET, "solana_withdraw_from_drift_account eval");