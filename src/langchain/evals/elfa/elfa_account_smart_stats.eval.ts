import { runEvals } from "../utils/runEvals";

const ELFA_ACCOUNT_SMART_STATS_DATASET = [
  {
    inputs: {
      query: "Get social metrics for 'elonmusk' from Elfa"
    },
    referenceOutputs: {
      tool: "elfa_account_smart_stats",
      response: "elonmusk",
    },
  },
];

runEvals(ELFA_ACCOUNT_SMART_STATS_DATASET, "elfa_account_smart_stats eval");