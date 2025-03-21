import { runEvals } from "../utils/runEvals";

const ELFA_API_KEY_STATUS_DATASET = [
  {
    inputs: {
      query: "Check my Elfa AI API Key usage status"
    },
    referenceOutputs: {
      tool: "elfa_api_key_status",
      response: "{}",
    },
  },
];

runEvals(ELFA_API_KEY_STATUS_DATASET, "elfa_api_key_status eval");