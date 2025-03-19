import { runEvals } from "../utils/runEvals";

const GET_INFO_DATASET = [
  {
    inputs: {
      query: "What is the latest news about Solana DeFi protocols?",
    },
    referenceOutputs: {
      tool: "solana_get_info",
      response: "Latest Solana DeFi protocols", // the search query may be different and wont be an exact match
    },
  },
  {
    inputs: {
      query: "Search for quantum computing",
    },
    referenceOutputs: {
      tool: "solana_get_info",
      response: "quantum computing", // the search query may be different and wont be an exact match
    },
  },
];

runEvals(GET_INFO_DATASET, "Get info tests");
