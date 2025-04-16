import { runEvals } from "../utils/runEvals";

const ALLORA_GET_PRICE_INFERENCE_DATASET = [
  {
    inputs: {
      query: "Get the 5m price inference for BTC from Allora"
    },
    referenceOutputs: {
      tool: "solana_allora_get_price_inference",
      response: JSON.stringify({
        tokenSymbol: "BTC",
        timeframe: "5m"
      }),
    },
  },
];

runEvals(ALLORA_GET_PRICE_INFERENCE_DATASET, "solana_allora_get_price_inference eval");