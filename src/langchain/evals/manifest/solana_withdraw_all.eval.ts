import { runEvals } from "../utils/runEvals";

const WITHDRAW_ALL_DATASET = [
  {
    inputs: {
      query: "Withdraw all funds from the Sol/USDC manifest market with ID ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ"
    },
    referenceOutputs: {
      tool: "solana_withdraw_all",
      response: JSON.stringify("ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ"),
    },
  },
];

runEvals(WITHDRAW_ALL_DATASET, "solana_withdraw_all eval");