import { runEvals } from "../utils/runEvals";

const VOLTR_DEPOSIT_STRATEGY_DATASET = [
  {
    inputs: {
      query:
        "Deposit 500 into strategy DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm of vault D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ in Voltr",
    },
    referenceOutputs: {
      tool: "solana_voltr_deposit_strategy",
      response: JSON.stringify({
        depositAmount: 500,
        vault: "D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ",
        strategy: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
      }),
    },
  },
];

runEvals(VOLTR_DEPOSIT_STRATEGY_DATASET, "solana_voltr_deposit_strategy eval");
