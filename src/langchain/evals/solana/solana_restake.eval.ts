import { runEvals } from "../utils/runEvals";

const RESTAKE_DATASET = [
  {
    inputs: {
      query: "Restake 2 SOL using Solayer",
    },
    referenceOutputs: {
      tool: "solana_restake",
      response: JSON.stringify({ amount: 2 }),
    },
  },
  {
    inputs: {
      query: "Restake 0.55 SOL",
    },
    referenceOutputs: {
      tool: "solana_restake",
      response: JSON.stringify({ amount: 0.55 }),
    },
  },
];

runEvals(RESTAKE_DATASET, "solana_restake eval");
