import { runEvals } from "../utils/runEvals";

const ALLORA_GET_ALL_TOPICS_DATASET = [
  {
    inputs: {
      query: "Get all topics from Allora"
    },
    referenceOutputs: {
      tool: "solana_allora_get_all_topics",
      response: "{}",
    },
  },
];

runEvals(ALLORA_GET_ALL_TOPICS_DATASET, "solana_allora_get_all_topics eval");