import { runEvals } from "../utils/runEvals";

const GET_HELIUS_WEBHOOK_DATASET = [
  {
    inputs: {
      query: "Retrieve the Helius webhook with ID 1ed4244d-a591-4854-ac31-cc28d40b8255"
    },
    referenceOutputs: {
      tool: "get_helius_webhook",
      response: JSON.stringify({
        webhookID: "1ed4244d-a591-4854-ac31-cc28d40b8255"
      }),
    },
  },
];

runEvals(GET_HELIUS_WEBHOOK_DATASET, "get_helius_webhook eval");