import { runEvals } from "../utils/runEvals";

const LEND_ASSET_DATASET = [
  {
    inputs: {
      query: "Lend 100 USDC using Lulo",
    },
    referenceOutputs: {
      tool: "solana_lend_asset",
      response: JSON.stringify({ amount: 100 }),
    },
  },
];

runEvals(LEND_ASSET_DATASET, "solana_lend_asset eval");
