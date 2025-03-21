import { runEvals } from "../utils/runEvals";

const OPENBOOK_CREATE_MARKET_DATASET = [
  {
    inputs: {
      query:
        "Create openbook market with base mint as SOL (So11111111111111111111111111111111111111112), quoteMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, lotSize=100, tickSize=1.5",
    },
    referenceOutputs: {
      tool: "solana_openbook_create_market",
      response: JSON.stringify({
        baseMint: "So11111111111111111111111111111111111111112",
        quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        lotSize: 100,
        tickSize: 1.5,
      }),
    },
  },
];

runEvals(OPENBOOK_CREATE_MARKET_DATASET, "solana_openbook_create_market eval");
