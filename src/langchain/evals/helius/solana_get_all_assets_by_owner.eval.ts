import { runEvals } from "../utils/runEvals";

const GET_ALL_ASSETS_BY_OWNER_DATASET = [
  {
    inputs: {
      query: "Get all assets for wallet 9Sx1apT66k8Ne5TP8PFua5w9DCQ8HztqZ4ZGh9Ejp2x2"
    },
    referenceOutputs: {
      tool: "solana_get_all_assets_by_owner",
      response: JSON.stringify({
        owner: "9Sx1apT66k8Ne5TP8PFua5w9DCQ8HztqZ4ZGh9Ejp2x2"
      }),
    },
  },
  {
    inputs: {
      query: "List up to 5 assets of wallet AKkw7F9K5m4Ne1FVmN8cCDMEV88bRZrU8eh7he6XzBvG"
    },
    referenceOutputs: {
      tool: "solana_get_all_assets_by_owner",
      response: JSON.stringify({
        owner: "AKkw7F9K5m4Ne1FVmN8cCDMEV88bRZrU8eh7he6XzBvG",
        limit: 5
      }),
    },
  },
];

runEvals(GET_ALL_ASSETS_BY_OWNER_DATASET, "solana_get_all_assets_by_owner eval");