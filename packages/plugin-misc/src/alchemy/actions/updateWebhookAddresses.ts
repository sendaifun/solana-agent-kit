import { z } from "zod";
import { alchemyUpdateWebhookAddresses } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyUpdateWebhookAddressesAction: Action = {
  name: "ALCHEMY_UPDATE_WEBHOOK_ADDRESSES",
  similes: [
    "alchemy update webhook addresses",
    "add addresses to alchemy webhook",
    "remove addresses from alchemy webhook",
  ],
  description: "Adds or removes addresses from an Alchemy Notify webhook",
  examples: [
    [
      {
        input: {
          webhookId: "wh_123",
          addressesToAdd: ["86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY"],
          addressesToRemove: [],
        },
        output: {
          status: "success",
          result: {},
          message: "Alchemy webhook addresses updated.",
        },
        explanation:
          "Adds a Solana address to an existing Alchemy Address Activity webhook.",
      },
    ],
  ],
  schema: z.object({
    webhookId: z.string().min(1).describe("Alchemy webhook ID"),
    addressesToAdd: z
      .array(z.string().min(1))
      .optional()
      .describe("Addresses to add to the webhook"),
    addressesToRemove: z
      .array(z.string().min(1))
      .optional()
      .describe("Addresses to remove from the webhook"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await alchemyUpdateWebhookAddresses(
        agent,
        input.webhookId,
        input.addressesToAdd ?? [],
        input.addressesToRemove ?? [],
      );

      return {
        status: "success",
        result,
        message: "Alchemy webhook addresses updated.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to update Alchemy webhook addresses: ${error.message}`,
      };
    }
  },
};

export default alchemyUpdateWebhookAddressesAction;
