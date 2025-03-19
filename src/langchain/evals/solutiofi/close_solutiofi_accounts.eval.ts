import { runEvals } from "../utils/runEvals";

const CLOSE_SOLUTIOFI_ACCOUNTS_DATASET = [
  {
    inputs: {
      query:
        "Close token accounts for mints [D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ,DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm]",
    },
    referenceOutputs: {
      tool: "close_solutiofi_accounts",
      response: JSON.stringify({
        mints: [
          "D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ",
          "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
        ],
      }),
    },
  },
];

runEvals(CLOSE_SOLUTIOFI_ACCOUNTS_DATASET, "close_solutiofi_accounts eval");
