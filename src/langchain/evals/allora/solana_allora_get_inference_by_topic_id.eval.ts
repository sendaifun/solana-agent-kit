import { runEvals } from "../utils/runEvals";

const ALLORA_GET_INFERENCE_BY_TOPIC_ID_DATASET = [
  {
    inputs: {
      query: "Get the inference for topic id 42 from Allora"
    },
    referenceOutputs: {
      tool: "solana_allora_get_inference_by_topic_id",
      response: "42",
    },
  },
];

runEvals(ALLORA_GET_INFERENCE_BY_TOPIC_ID_DATASET, "solana_allora_get_inference_by_topic_id eval");