import { runEvals } from "../utils/runEvals";

const BURN_SOLUTIOFI_TOKENS_DATASET = [
  {
    inputs: {
      query: "Burn tokens from [So11111111111111111111111111111111111111112]",
    },
    referenceOutputs: {
      tool: "burn_solutiofi_tokens",
      response: JSON.stringify({
        mints: ["So11111111111111111111111111111111111111112"],
      }),
    },
  },
];

runEvals(BURN_SOLUTIOFI_TOKENS_DATASET, "burn_solutiofi_tokens eval");
