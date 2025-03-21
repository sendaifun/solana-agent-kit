import { runEvals } from "../utils/runEvals";

const RPS_DATASET = [
  {
    inputs: {
      query: "Play rock paper scissors with and pick rock for 0.01 SOL",
    },
    referenceOutputs: {
      tool: "rock_paper_scissors",
      response: JSON.stringify({
        choice: "rock",
        amount: 0.01,
      }),
    },
  },
  {
    inputs: {
      query: "Start a rock paper scissors game, playing scissors for 0.05 sol",
    },
    referenceOutputs: {
      tool: "rock_paper_scissors",
      response: JSON.stringify({
        choice: "scissors",
        amount: 0.05,
      }),
    },
  },
];

runEvals(RPS_DATASET, "rock_paper_scissors eval");
