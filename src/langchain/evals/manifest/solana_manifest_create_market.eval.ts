import { runEvals } from "../utils/runEvals";

const MANIFEST_CREATE_MARKET_DATASET = [
  {
    inputs: {
      query:
        "Create a manifest market with the base mint as SOL and quote mint as USDC",
    },
    referenceOutputs: {
      tool: "solana_manifest_create_market",
      response: JSON.stringify({
        baseMint: "So111...",
        quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      }),
    },
  },
];

runEvals(MANIFEST_CREATE_MARKET_DATASET, "solana_manifest_create_market eval");
