import { runEvals } from "../utils/runEvals";

const REGISTER_DOMAIN_DATASET = [
  {
    inputs: {
      query: "Register domain myblog.sol with 2KB space"
    },
    referenceOutputs: {
      tool: "solana_register_domain",
      response: JSON.stringify({
        name: "myblog",
        spaceKB: 2
      }),
    },
  },
];

runEvals(REGISTER_DOMAIN_DATASET, "solana_register_domain eval");