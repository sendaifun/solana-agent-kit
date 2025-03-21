import { runEvals } from "../utils/runEvals";

const ELFA_PING_DATASET = [
  {
    inputs: {
      query: "Check Elfa AI server health"
    },
    referenceOutputs: {
      tool: "elfa_ping",
      response: "{}",
    },
  },
];

runEvals(ELFA_PING_DATASET, "elfa_ping eval");