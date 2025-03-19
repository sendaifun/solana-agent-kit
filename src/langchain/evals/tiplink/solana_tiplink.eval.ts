import { runEvals } from "../utils/runEvals";

const TIPLINK_DATASET = [
  {
    inputs: {
      query: "Create a tiplink for 0.5 SOL"
    },
    referenceOutputs: {
      tool: "solana_tiplink",
      response: JSON.stringify({
        amount: 0.5
      }),
    },
  },
  {
    inputs: {
      query: "Generate a tiplink for 100 tokens of EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    },
    referenceOutputs: {
      tool: "solana_tiplink",
      response: JSON.stringify({
        amount: 100,
        splmintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      }),
    },
  },
];

runEvals(TIPLINK_DATASET, "solana_tiplink eval");