import { runEvals } from "../utils/runEvals";

const ORCA_CREATE_CLMM_DATASET = [
  {
    inputs: {
      query:
        "Create an Orca CLMM with mintA JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN, mintB EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, initial price 0.008, feeTier=200",
    },
    referenceOutputs: {
      tool: "orca_create_clmm",
      response: JSON.stringify({
        mintDeploy: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        mintPair: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        initialPrice: 0.008,
        feeTier: 200,
      }),
    },
  },
];

runEvals(ORCA_CREATE_CLMM_DATASET, "orca_create_clmm eval");
