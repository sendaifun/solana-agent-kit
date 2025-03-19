import { runEvals } from "../utils/runEvals";

const GET_ASSETS_BY_CREATOR_DATASET = [
  {
    inputs: {
      query: "Fetch assets created by D3XrkNZz6wx6cofot7Zoh"
    },
    referenceOutputs: {
      tool: "solana_get_assets_by_creator",
      response: JSON.stringify({
        creator: "D3XrkNZz6wx6cofot7Zoh"
      }),
    },
  },
];

runEvals(GET_ASSETS_BY_CREATOR_DATASET, "solana_get_assets_by_creator eval");