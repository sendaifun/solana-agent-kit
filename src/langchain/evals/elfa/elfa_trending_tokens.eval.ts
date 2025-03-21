import { runEvals } from "../utils/runEvals";

const ELFA_TRENDING_TOKENS_DATASET = [
  {
    inputs: {
      query: "What tokens are trending on Elfa AI?"
    },
    referenceOutputs: {
      tool: "elfa_trending_tokens",
      response: "{}",
    },
  },
];

runEvals(ELFA_TRENDING_TOKENS_DATASET, "elfa_trending_tokens eval");