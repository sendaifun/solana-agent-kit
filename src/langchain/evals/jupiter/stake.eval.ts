import { runEvals } from "../utils/runEvals";

const dataset = [
  {
    inputs: {
      query: "Stake 1 SOL",
    },
    referenceOutputs: {
      tool: "solana_stake",
      response: JSON.stringify({
        amount: 1,
      }),
    },
  },
  {
    inputs: {
      query: "Stake -1 SOL ",
    },
    referenceOutputs: {
      tool: "",
      response: JSON.stringify({}),
    },
  },
  {
    inputs: {
      query: "Stake some SOL",
    },
    referenceOutputs: {
      tool: "",
      response: JSON.stringify({}),
    },
  },
];

runEvals(dataset, "Jupiter staking test");
