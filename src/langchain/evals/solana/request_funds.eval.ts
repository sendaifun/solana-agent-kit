import { runEvals } from "../utils/runEvals";

const REQUEST_FUNDS_DATASET = [
  {
    inputs: {
      query: "Request some devnet sol from the faucet",
    },
    referenceOutputs: {
      tool: "solana_request_funds",
      response: "{}",
    },
  },

  {
    inputs: {
      query: "Get some SOL from the faucet",
    },
    referenceOutputs: {
      tool: "solana_request_funds",
      response: "{}",
    },
  },
];

runEvals(REQUEST_FUNDS_DATASET, "Faucet test");
