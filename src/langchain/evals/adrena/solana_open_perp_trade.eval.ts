import { runEvals } from "../utils/runEvals";

const OPEN_PERP_TRADE_DATASET = [
  {
    inputs: {
      query: "Open a long perp trade on Adrena with collateral=1.5 USDC, tradeMint=5Ci1rbbB2v1zYsa2p8XR8wRr1pb2kqeNydDnvHqpbAzE, leverage=50000, side=long"
    },
    referenceOutputs: {
      tool: "solana_open_perp_trade",
      response: JSON.stringify({
        collateralAmount: 1.5,
        collateralMint: "5Ci1rbbB2v1zYsa2p8XR8wRr1pb2kqeNydDnvHqpbAzE",
        tradeMint: "5Ci1rbbB2v1zYsa2p8XR8wRr1pb2kqeNydDnvHqpbAzE",
        leverage: 50000,
        side: "long"
      }),
    },
  },
  {
    inputs: {
      query: "Open a short perp trade on Adrena with collateral=0.2 USDC, tradeMint=7q2KV9FWwZfQcdC1GFHxP3H6NDthxtvmzGzHsbtUFbtZ, leverage=100000"
    },
    referenceOutputs: {
      tool: "solana_open_perp_trade",
      response: JSON.stringify({
        collateralAmount: 0.2,
        collateralMint: "7q2KV9FWwZfQcdC1GFHxP3H6NDthxtvmzGzHsbtUFbtZ",
        tradeMint: "7q2KV9FWwZfQcdC1GFHxP3H6NDthxtvmzGzHsbtUFbtZ",
        leverage: 100000,
        side: "short"
      }),
    },
  },
];

runEvals(OPEN_PERP_TRADE_DATASET, "solana_open_perp_trade eval");