import { runEvals } from "../utils/runEvals";

const DRIFT_LEND_AND_BORROW_APY_DATASET = [
  {
    inputs: {
      query: "What's the lending and borrowing APY for USDC on Drift?"
    },
    referenceOutputs: {
      tool: "drift_lend_and_borrow_apy",
      response: "USDC",
    },
  },
];

runEvals(DRIFT_LEND_AND_BORROW_APY_DATASET, "drift_lend_and_borrow_apy eval");