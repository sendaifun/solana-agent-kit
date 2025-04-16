import { runEvals } from "../utils/runEvals";

const SEND_TX_PRIORITY_FEE_DATASET = [
  {
    inputs: {
      query:
        "Send 1 SOL to D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ with a very high prio fee",
    },
    referenceOutputs: {
      tool: "solana_send_transaction_with_priority_fee",
      response: JSON.stringify({
        priorityLevel: "VeryHigh",
        amount: 1,
        to: "D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ",
      }),
    },
  },
  {
    inputs: {
      query:
        "Send 250 SOL to D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ. Use a low priority fee.",
    },
    referenceOutputs: {
      tool: "solana_send_transaction_with_priority_fee",
      response: JSON.stringify({
        priorityLevel: "Low",
        amount: 250,
        to: "D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ",
      }),
    },
  },
];

runEvals(
  SEND_TX_PRIORITY_FEE_DATASET,
  "solana_send_transaction_with_priority_fee eval",
);
