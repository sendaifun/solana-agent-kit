import { z } from "zod";
import { alchemyCreateAddressActivityWebhook } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyCreateWebhookAction: Action = {
  name: "ALCHEMY_CREATE_ADDRESS_ACTIVITY_WEBHOOK",
  similes: [
    "alchemy create webhook",
    "create alchemy address webhook",
    "monitor solana addresses with alchemy",
  ],
  description:
    "Creates an Alchemy Notify Address Activity webhook, defaulting to Solana mainnet",
  examples: [
    [
      {
        input: {
          addresses: ["86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY"],
          webhookUrl: "https://example.com/webhook",
          network: "SOLANA_MAINNET",
        },
        output: {
          status: "success",
          webhook: {
            data: {
              id: "wh_123",
            },
          },
          message: "Alchemy webhook created.",
        },
        explanation:
          "Creates a Solana address activity webhook using Alchemy Notify.",
      },
    ],
  ],
  schema: z.object({
    addresses: z.array(z.string().min(1)).min(1).describe("Addresses to track"),
    webhookUrl: z.string().url().describe("Webhook destination URL"),
    network: z
      .string()
      .optional()
      .describe("Alchemy Notify network, defaulting to SOLANA_MAINNET"),
    name: z.string().optional().describe("Optional webhook name"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const webhook = await alchemyCreateAddressActivityWebhook(
        agent,
        input.addresses,
        input.webhookUrl,
        {
          network: input.network,
          name: input.name,
        },
      );

      return {
        status: "success",
        webhook,
        message: "Alchemy webhook created.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create Alchemy webhook: ${error.message}`,
      };
    }
  },
};

export default alchemyCreateWebhookAction;
