import { runEvals } from "../utils/runEvals";

const dataset = [
  {
    inputs: {
      query: "Check my SOL balance",
    },
    referenceOutputs: {
      tool: "solana_balance",
      response: "{}",
    },
  },
  {
    inputs: {
      query: "Check my USDC balance",
    },
    referenceOutputs: {
      tool: "solana_balance",
      response: JSON.stringify({
        tokenAddres: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      }),
    },
  },
];

runEvals(dataset, "Own balance tests");
