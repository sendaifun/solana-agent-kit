import { runEvals } from "../utils/runEvals";

const FLASH_OPEN_TRADE_DATASET = [
  {
    inputs: {
      query: "Open a 10x long on SOL with collateral = 200 USD on Flash"
    },
    referenceOutputs: {
      tool: "solana_flash_open_trade",
      response: JSON.stringify({
        token: "SOL",
        type: "long",
        collateral: 200,
        leverage: 10
      }),
    },
  },
  {
    inputs: {
      query: "Open a 5x short on BTC with 50 USD"
    },
    referenceOutputs: {
      tool: "solana_flash_open_trade",
      response: JSON.stringify({
        token: "BTC",
        type: "short",
        collateral: 50,
        leverage: 5
      }),
    },
  },
];

runEvals(FLASH_OPEN_TRADE_DATASET, "solana_flash_open_trade eval");