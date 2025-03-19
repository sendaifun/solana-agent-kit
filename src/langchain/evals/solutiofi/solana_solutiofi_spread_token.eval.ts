import { runEvals } from "../utils/runEvals";

const SOLUTIOFI_SPREAD_TOKEN_DATASET = [
  {
    inputs: {
      query: "Spread 100 SOL across [ { mint: JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN, percentage: 50 }, { mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, percentage: 50 } ] slippage=0.5, onlyDirectRoutes=false, priorityFee=fast"
    },
    referenceOutputs: {
      tool: "spread_token",
      response: JSON.stringify({
        inputAsset: {
          mint: "So11111111111111111111111111111111111111112",
          inputAmount: "100",
          slippage: "0.5",
          onlyDirectRoutes: false
        },
        targetTokens: [
          {
            mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            percentage: 50
          },
          {
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            percentage: 50
          }
        ],
        priorityFee: "fast"
      }),
    },
  },
  {
    inputs: {
      query: "Spread 20 tokens of 7Li1P2hiH7nRiQybs4bcJ3EBzQ9zYEkR6m9T8r7uMhm3 to [ { mint: 2EEr5F7Eg78LTPPEr2L4StgyHfv4bsKtbMU9eiANZSuW, percentage: 70 }, { mint: So11111111111111111111111111111111111111112, percentage: 30 } ] using slow priority"
    },
    referenceOutputs: {
      tool: "spread_token",
      response: JSON.stringify({
        inputAsset: {
          mint: "7Li1P2hiH7nRiQybs4bcJ3EBzQ9zYEkR6m9T8r7uMhm3",
          inputAmount: "20",
          slippage: "0.0",
          onlyDirectRoutes: false
        },
        targetTokens: [
          {
            mint: "2EEr5F7Eg78LTPPEr2L4StgyHfv4bsKtbMU9eiANZSuW",
            percentage: 70
          },
          {
            mint: "So11111111111111111111111111111111111111112",
            percentage: 30
          }
        ],
        priorityFee: "slow"
      }),
    },
  },
];

runEvals(SOLUTIOFI_SPREAD_TOKEN_DATASET, "spread_token eval");