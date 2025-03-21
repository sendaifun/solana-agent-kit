import { runEvals } from "../utils/runEvals";

const GET_MAIN_DOMAIN_DATASET = [
  {
    inputs: {
      query:
        "Get the favorite or main domain for the wallet 9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u",
    },
    referenceOutputs: {
      tool: "solana_get_main_domain",
      response: "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u",
    },
  },
];

runEvals(GET_MAIN_DOMAIN_DATASET, "solana_get_main_domain eval");