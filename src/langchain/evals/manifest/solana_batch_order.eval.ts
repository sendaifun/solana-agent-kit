import { runEvals } from "../utils/runEvals";

const BATCH_ORDER_DATASET = [
  {
    inputs: {
      query: "Place multiple limit orders in one tx on Manifest market 9oxabc with pattern buy total qty=100 spaced at 1% below $2.50"
    },
    referenceOutputs: {
      tool: "solana_batch_order",
      response: JSON.stringify({
        marketId: "9oxabc",
        pattern: {
          side: "Buy",
          totalQuantity: 100,
          priceRange: { max: 2.5 },
          spacing: { type: "percentage", value: 1 },
          numberOfOrders: 5
        }
      }),
    },
  },
  {
    inputs: {
      query: `Create multiple orders on market 5Swu with an orders array:
      1) buy 2 qty at $0.5
      2) sell 2.5 qty at $0.8
      3) buy 1.2 qty at $0.6`
    },
    referenceOutputs: {
      tool: "solana_batch_order",
      response: JSON.stringify({
        marketId: "5Swu",
        orders: [
          { quantity: 2, side: "Buy", price: 0.5 },
          { quantity: 2.5, side: "Sell", price: 0.8 },
          { quantity: 1.2, side: "Buy", price: 0.6 },
        ],
      }),
    },
  },
];

runEvals(BATCH_ORDER_DATASET, "solana_batch_order eval");