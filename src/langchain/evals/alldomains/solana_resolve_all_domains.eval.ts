import { runEvals } from "../utils/runEvals";

const RESOLVE_ALL_DOMAINS_DATASET = [
  {
    inputs: {
      query: "Resolve domain mydomain.blink to a pubkey"
    },
    referenceOutputs: {
      tool: "solana_resolve_all_domains",
      response: "mydomain.blink",
    },
  },
  {
    inputs: {
      query: "Find the owner of spamm.bonk"
    },
    referenceOutputs: {
      tool: "solana_resolve_all_domains",
      response: "spamm.bonk",
    },
  },
];

runEvals(RESOLVE_ALL_DOMAINS_DATASET, "solana_resolve_all_domains eval");