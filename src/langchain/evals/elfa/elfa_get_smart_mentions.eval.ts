import { runEvals } from "../utils/runEvals";

const ELFA_GET_SMART_MENTIONS_DATASET = [
  {
    inputs: {
      query: "Fetch tweets by smart accounts from Elfa AI"
    },
    referenceOutputs: {
      tool: "elfa_get_smart_mentions",
      response: JSON.stringify({
        limit: 100,
        offset: 0
      }),
    },
  },
];

runEvals(ELFA_GET_SMART_MENTIONS_DATASET, "elfa_get_smart_mentions eval");