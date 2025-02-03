import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { deleteHeliusWebhook } from "../../tools/helius";

const deleteWebhookAction: Action = {
  name: "DELETE_HELIOUS_WEBHOOK",
  similes: ["remove webhook", "unregister webhook", "delete webhook"],
  description: "Deletes a Helius webhook by its unique ID",
  examples: [
    [
      {
        input: {
          webhookID: "webhook_123",
        },
        output: {
          status: "success",
          message: "Webhook deleted successfully.",
        },
        explanation: "Permanently removes a Helius webhook.",
      },
    ],
  ],
  schema: z.object({
    webhookID: z
      .string()
      .min(1)
      .describe("The unique identifier of the Helius webhook to delete"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await deleteHeliusWebhook(agent, input.webhookID);

    return {
      status: "success",
      message: result.message || "Webhook deleted successfully.",
    };
  },
};

export default deleteWebhookAction;
