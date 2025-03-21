import { runEvals } from "../utils/runEvals";

const dataset = [
  {
    inputs: {
      query: "Get the current tps of Solana",
    },
    referenceOutputs: {
      tool: "solana_get_tps",
      response: "{}",
    },
  },
];

runEvals(dataset, "TPS test");
