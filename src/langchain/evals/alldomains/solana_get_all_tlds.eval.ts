import { runEvals } from "../utils/runEvals";

const GET_ALL_TLDS_DATASET = [
  {
    inputs: {
      query: "Which TLDs exist on AllDomains?"
    },
    referenceOutputs: {
      tool: "solana_get_all_tlds",
      response: "{}",
    },
  },
];

runEvals(GET_ALL_TLDS_DATASET, "solana_get_all_tlds eval");