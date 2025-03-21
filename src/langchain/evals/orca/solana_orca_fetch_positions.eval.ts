import { runEvals } from "../utils/runEvals";

const ORCA_FETCH_POSITIONS_DATASET = [
  {
    inputs: {
      query: "Fetch all my current orca liquidity positions"
    },
    referenceOutputs: {
      tool: "orca_fetch_positions",
      response: "{}",
    },
  },
];

runEvals(ORCA_FETCH_POSITIONS_DATASET, "solana_orca_fetch_positions eval");