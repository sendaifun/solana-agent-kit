import { runEvals } from "../utils/runEvals";

const GET_ASSET_DATASET = [
  {
    inputs: {
      query: "Fetch the asset details for 8TrvJBRa6Pzb9BDadqro"
    },
    referenceOutputs: {
      tool: "solana_get_asset",
      response: "8TrvJBRa6Pzb9BDadqro",
    },
  },
];

runEvals(GET_ASSET_DATASET, "solana_get_asset eval");