import { runEvals } from "../utils/runEvals";

const LULO_LEND_DATASET = [
  {
    inputs: {
      query:
        "Lend 0.25 SOL using Lulo with mint So11111111111111111111111111111111111111112",
    },
    referenceOutputs: {
      tool: "solana_lulo_lend",
      response: JSON.stringify({
        mintAddress: "So11111111111111111111111111111111111111112",
        amount: 0.25,
      }),
    },
  },
];

runEvals(LULO_LEND_DATASET, "solana_lulo_lend eval");
