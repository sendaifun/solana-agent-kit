import { runEvals } from "../utils/runEvals";

const RESOLVE_DOMAIN_DATASET = [
  {
    inputs: {
      query: "What is the pubkey behind pumpfun.sol?"
    },
    referenceOutputs: {
      tool: "solana_resolve_domain",
      response: "pumpfun.sol"
    },
  },
];

runEvals(RESOLVE_DOMAIN_DATASET, "solana_resolve_domain eval");