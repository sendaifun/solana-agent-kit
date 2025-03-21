import { runEvals } from "../utils/runEvals";

const SOLUTIOFI_MERGE_TOKENS_DATASET = [
  {
    inputs: {
      query: "Merge tokens [ { mint: 2EEr5F7Eg78LTPPEr2L4StgyHfv4bsKtbMU9eiANZSuW, inputAmount: 100, slippage: 0.5, onlyDirectRoutes: false } ] into USDC using normal priority fee"
    },
    referenceOutputs: {
      tool: "merge_tokens",
      response: JSON.stringify({
        inputAssets: [
          {
            mint: "2EEr5F7Eg78LTPPEr2L4StgyHfv4bsKtbMU9eiANZSuW",
            inputAmount: "100",
            slippage: "0.5",
            onlyDirectRoutes: false
          }
        ],
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        priorityFee: "normal"
      }),
    },
  },
  {
    inputs: {
      query: "Merge tokens [ { mint: So11111111111111111111111111111111111111112, inputAmount: 10, slippage: 1, onlyDirectRoutes: true } ] to 7Li1P2hiH7nRiQybs4bcJ3EBzQ9zYEkR6m9T8r7uMhm3 with a fast priority"
    },
    referenceOutputs: {
      tool: "merge_tokens",
      response: JSON.stringify({
        inputAssets: [
          {
            mint: "So11111111111111111111111111111111111111112",
            inputAmount: "10",
            slippage: "1",
            onlyDirectRoutes: true
          }
        ],
        outputMint: "7Li1P2hiH7nRiQybs4bcJ3EBzQ9zYEkR6m9T8r7uMhm3",
        priorityFee: "fast"
      }),
    },
  },
];

runEvals(SOLUTIOFI_MERGE_TOKENS_DATASET, "merge_tokens eval");