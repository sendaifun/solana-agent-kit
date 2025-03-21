import { runEvals } from "../utils/runEvals";

const HELIUS_CREATE_WEBHOOK_DATASET = [
  {
    inputs: {
      query:
        "Create a Helius Webhook for D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ with a callback to https://myserver.com/webhook",
    },
    referenceOutputs: {
      tool: "create_helius_webhook",
      response: JSON.stringify({
        accountAddresses: ["D9BU6XqpBdyjH2Zv95MLXLAdLqJoLysf7bMjpKCwRonQ"],
        webhookURL: "https://myserver.com/webhook",
      }),
    },
  },
];

runEvals(HELIUS_CREATE_WEBHOOK_DATASET, "solana_helius_create_webhook eval");
