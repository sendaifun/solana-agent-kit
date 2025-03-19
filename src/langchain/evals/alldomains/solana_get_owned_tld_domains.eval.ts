import { runEvals } from "../utils/runEvals";

const GET_OWNED_TLD_DOMAINS_DATASET = [
  {
    inputs: {
      query: "Show me all .blink domains I own"
    },
    referenceOutputs: {
      tool: "solana_get_owned_tld_domains",
      response: "blink",
    },
  },
  {
    inputs: {
      query: "List my .bonk domains"
    },
    referenceOutputs: {
      tool: "solana_get_owned_tld_domains",
      response: "bonk",
    },
  },
];

runEvals(GET_OWNED_TLD_DOMAINS_DATASET, "solana_get_owned_tld_domains eval");