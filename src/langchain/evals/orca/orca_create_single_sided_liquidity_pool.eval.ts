import { runEvals } from "../utils/runEvals";

const ORCA_CREATE_SINGLE_SIDED_LP_DATASET = [
  {
    inputs: {
      query:
        "Create single-sided liquidity pool with 500000000 depositTokenAmount, depositMint So11111111111111111111111111111111111111112, otherMint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, initialPrice=0.5, maxPrice=2.0, feeTier=30",
    },
    referenceOutputs: {
      tool: "orca_create_single_sided_liquidity_pool",
      response: JSON.stringify({
        depositTokenAmount: 500000000,
        depositTokenMint: "So11111111111111111111111111111111111111112",
        otherTokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        initialPrice: 0.5,
        maxPrice: 2.0,
        feeTier: 30,
      }),
    },
  },
];

runEvals(
  ORCA_CREATE_SINGLE_SIDED_LP_DATASET,
  "orca_create_single_sided_liquidity_pool eval",
);
