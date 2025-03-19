import { runEvals } from "../utils/runEvals";

const DELETE_HELIUS_WEBHOOK_DATASET = [
  {
    inputs: {
      query: "Delete the Helius webhook with ID 2f414c1d-8888-2222-aaaa-cc28d40bxxxxx"
    },
    referenceOutputs: {
      tool: "delete_helius_webhook",
      response: JSON.stringify({
        webhookID: "2f414c1d-8888-2222-aaaa-cc28d40bxxxxx"
      }),
    },
  },
];

runEvals(DELETE_HELIUS_WEBHOOK_DATASET, "delete_helius_webhook eval");