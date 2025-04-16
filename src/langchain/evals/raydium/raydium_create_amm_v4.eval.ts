import { runEvals } from "../utils/runEvals";

const RAYDIUM_CREATE_AMMV4_DATASET = [
  {
    inputs: {
      query:
        "Create a Raydium AMM V4 with marketId 8BfNRNtQCNZy, baseAmount=100000, quoteAmount=200000, startTime is now",
    },
    referenceOutputs: {
      tool: "raydium_create_ammV4",
      response: JSON.stringify({
        marketId: "8BfNRNtQCNZy",
        baseAmount: 100000,
        quoteAmount: 200000,
        startTime: 0,
      }),
    },
  },
];

runEvals(RAYDIUM_CREATE_AMMV4_DATASET, "raydium_create_ammV4 eval");
