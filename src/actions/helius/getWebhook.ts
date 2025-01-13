import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getHeliusWebhook } from "../../tools/helius";

const getWebhookAction: Action = {
  name: "GET_HELIOUS_WEBHOOK",
  similes: ["fetch webhook details", "retrieve webhook", "get webhook info"],
  description: "Retrieves details of a Helius webhook by its unique ID",
  examples: [
    [
      {
        input: {
          webhookID: "webhook_123",
        },
        output: {
          status: "success",
          wallet: "WalletPublicKey",
          webhookURL: "https://yourdomain.com/webhook",
          transactionTypes: ["Any"],
          accountAddresses: ["SomePublicKey", "AnotherPublicKey"],
          webhookType: "enhanced",
          message: "Webhook details retrieved successfully.",
        },
        explanation:
          "Retrieves detailed information about an existing Helius webhook, including the wallet address it monitors, the types of transactions it tracks, and the specific webhook URL.",
      },
    ],
  ],
  schema: z.object({
    webhookID: z
      .string()
      .min(1)
      .describe("The unique identifier of the Helius webhook to retrieve"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const webhookDetails = await getHeliusWebhook(agent, input.webhookID);

    return {
      status: "success",
      ...webhookDetails,
      message: "Webhook details retrieved successfully.",
    };
  },
};

export default getWebhookAction;
