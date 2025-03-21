import { runEvals } from "../utils/runEvals";

const GET_OWNED_DOMAINS_DATASET = [
  {
    inputs: {
      query:
        "Show me all the domains owned by wallet GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
    },
    referenceOutputs: {
      tool: "solana_get_owned_domains",
      response: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
    },
  },
];

runEvals(GET_OWNED_DOMAINS_DATASET, "solana_get_owned_domains eval");