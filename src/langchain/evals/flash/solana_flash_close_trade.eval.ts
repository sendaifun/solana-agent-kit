import { runEvals } from "../utils/runEvals";

const FLASH_CLOSE_TRADE_DATASET = [
  {
    inputs: {
      query: "Close my flash short on ETH"
    },
    referenceOutputs: {
      tool: "solana_flash_close_trade",
      response: JSON.stringify({
        token: "ETH",
        side: "short"
      }),
    },
  },
];

runEvals(FLASH_CLOSE_TRADE_DATASET, "solana_flash_close_trade eval");