import { z } from "zod";
import { alchemyReplaceWebhookAddresses } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyReplaceWebhookAddressesAction: Action = {
  name: "ALCHEMY_REPLACE_WEBHOOK_ADDRESSES",
  similes: [
    "alchemy replace webhook addresses",
    "set alchemy webhook addresses",
    "replace addresses in alchemy webhook",
  ],
  description: "Replaces the full address list for an Alchemy Notify webhook",
  examples: [
    [
      {
        input: {
          webhookId: "wh_123",
          addresses: ["86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY"],
        },
        output: {
          status: "success",
          result: {},
          message: "Alchemy webhook addresses replaced.",
        },
        explanation:
          "Replaces the tracked address list for an existing Alchemy Address Activity webhook.",
      },
    ],
  ],
  schema: z.object({
    webhookId: z.string().min(1).describe("Alchemy webhook ID"),
    addresses: z
      .array(z.string().min(1))
      .min(1)
      .describe("Replacement address list"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await alchemyReplaceWebhookAddresses(
        agent,
        input.webhookId,
        input.addresses,
      );

      return {
        status: "success",
        result,
        message: "Alchemy webhook addresses replaced.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to replace Alchemy webhook addresses: ${error.message}`,
      };
    }
  },
};

export default alchemyReplaceWebhookAddressesAction;
