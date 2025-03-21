import { runEvals } from "../utils/runEvals";

const CLOSE_PERP_TRADE_DATASET = [
  {
    inputs: {
      query: "Close my long perp trade on Adrena at price=100, tradeMint=5Ci1rbbB2v1zYsa2p8XR8wRr1pb2kqeNydDnvHqpbAzE"
    },
    referenceOutputs: {
      tool: "solana_close_perp_trade",
      response: JSON.stringify({
        tradeMint: "5Ci1rbbB2v1zYsa2p8XR8wRr1pb2kqeNydDnvHqpbAzE",
        price: 100,
        side: "long"
      }),
    },
  },
  {
    inputs: {
      query: "Close a short perp trade on Adrena with tradeMint=9AdRL8zJhLoB9EKE2f8jNDTuKYh1XaSh1yr8vK6crbBP at price=150"
    },
    referenceOutputs: {
      tool: "solana_close_perp_trade",
      response: JSON.stringify({
        tradeMint: "9AdRL8zJhLoB9EKE2f8jNDTuKYh1XaSh1yr8vK6crbBP",
        price: 150,
        side: "short"
      }),
    },
  },
];

runEvals(CLOSE_PERP_TRADE_DATASET, "solana_close_perp_trade eval");