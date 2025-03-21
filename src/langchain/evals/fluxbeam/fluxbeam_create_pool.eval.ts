import { runEvals } from "../utils/runEvals";

const FLUXBEAM_CREATE_POOL_DATASET = [
  {
    inputs: {
      query: "Create a fluxbeam pool with 10 SOL and 100 USDC"
    },
    referenceOutputs: {
      tool: "fluxbeam_create_pool",
      response: JSON.stringify({
        token_a: "So11111111111111111111111111111111111111112",
        token_a_amount: 10,
        token_b: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        token_b_amount: 100
      }),
    },
  },
];

runEvals(FLUXBEAM_CREATE_POOL_DATASET, "fluxbeam_create_pool eval");