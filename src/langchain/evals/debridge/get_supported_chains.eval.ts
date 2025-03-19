import { runEvals } from "../utils/runEvals";

const GET_SUPPORTED_CHAINS_DATASET = [
  {
    inputs: {
      query: "Which chains are supported by the deBridge DLN protocol?",
    },
    referenceOutputs: {
      tool: "get_supported_chains",
      response: "{}",
    },
  },
];

runEvals(GET_SUPPORTED_CHAINS_DATASET, "get_supported_chains eval");