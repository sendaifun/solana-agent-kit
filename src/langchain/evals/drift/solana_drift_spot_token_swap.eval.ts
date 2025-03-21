import { runEvals } from "../utils/runEvals";

const DRIFT_SPOT_TOKEN_SWAP_DATASET = [
  {
    inputs: {
      query: "Swap 5 SOL for USDC on drift with 1% slippage"
    },
    referenceOutputs: {
      tool: "drift_spot_token_swap",
      response: JSON.stringify({
        fromSymbol: "SOL",
        toSymbol: "USDC",
        fromAmount: 5,
        slippage: 1
      }),
    },
  },
  {
    inputs: {
      query: "Swap 100 USDC to SOL on drift for 0.2% slippage"
    },
    referenceOutputs: {
      tool: "drift_spot_token_swap",
      response: JSON.stringify({
        fromSymbol: "USDC",
        toSymbol: "SOL",
        fromAmount: 100,
        slippage: 0.2
      }),
    },
  },
];

runEvals(DRIFT_SPOT_TOKEN_SWAP_DATASET, "solana_drift_spot_token_swap eval");