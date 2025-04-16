import { runEvals } from "../utils/runEvals";

const GET_DOMAIN_DATASET = [
  {
    inputs: {
      query: "What is the .sol domain for 9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u?",
    },
    referenceOutputs: {
      tool: "solana_get_domain",
      response: "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u",
    },
  },
];

runEvals(GET_DOMAIN_DATASET, "solana_get_domain eval");