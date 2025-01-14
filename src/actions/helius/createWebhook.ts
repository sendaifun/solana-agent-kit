import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { create_HeliusWebhook } from "../../tools/helius";

const createWebhookAction: Action = {
  name: "CREATE_HELIOUS_WEBHOOK",
  similes: ["setup webhook", "register webhook", "initiate webhook"],
  description:
    "Creates a new webhook in the Helius system to monitor transactions for specified account addresses",
  examples: [
    [
      {
        input: {
          accountAddresses: [
            "BVdNLvyG2DNiWAXBE9qAmc4MTQXymd5Bzfo9xrQSUzVP",
            "Eo2ciguhMLmcTWXELuEQPdu7DWZt67LHXb2rdHZUbot7",
          ],
          webhookURL: "https://yourdomain.com/webhook",
        },
        output: {
          status: "success",
          webhookURL: "https://yourdomain.com/webhook",
          webhookID: "webhook_123",
          message: "Webhook created successfully.",
        },
        explanation:
          "Creates a Webhook to send live notifications on the given Url with the wallet Addresses.",
      },
    ],
  ],
  schema: z.object({
    accountAddresses: z
      .array(z.string())
      .min(1)
      .describe("List of Solana account public keys to monitor"),
    webhookURL: z
      .string()
      .url()
      .describe("The URL where Helius will send webhook notifications"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const response = await create_HeliusWebhook(
      agent,
      input.accountAddresses,
      input.webhookURL,
    );

    return {
      status: "success",
      ...response,
      message: "Webhook created successfully.",
    };
  },
};

export default createWebhookAction;
