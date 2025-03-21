import { runEvals } from "../utils/runEvals";

const WALLET_ADDRESS_DATASET = [
  {
    inputs: {
      query: "What's your wallet address?",
    },
    referenceOutputs: {
      tool: "solana_get_wallet_address",
      response: "{}",
    },
  },
  {
    inputs: {
      query: "Where can I send tokens? Show me your address",
    },
    referenceOutputs: {
      tool: "solana_get_wallet_address",
      response: "{}",
    },
  },
];

runEvals(WALLET_ADDRESS_DATASET, "Get wallet address tests");
