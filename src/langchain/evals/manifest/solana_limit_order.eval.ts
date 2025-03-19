import { runEvals } from "../utils/runEvals";

const LIMIT_ORDER_DATASET = [
  {
    inputs: {
      query: "Place a limit buy order on Manifest market ENhU8L with quantity=10 at price=1.5"
    },
    referenceOutputs: {
      tool: "solana_limit_order",
      response: JSON.stringify({
        marketId: "ENhU8L",
        quantity: 10,
        side: "Buy",
        price: 1.5
      }),
    },
  },
  {
    inputs: {
      query: "Limit sell 0.25 on market 9z8Fvf at 100 USDC"
    },
    referenceOutputs: {
      tool: "solana_limit_order",
      response: JSON.stringify({
        marketId: "9z8Fvf",
        quantity: 0.25,
        side: "Sell",
        price: 100
      }),
    },
  },
];

runEvals(LIMIT_ORDER_DATASET, "solana_limit_order eval");