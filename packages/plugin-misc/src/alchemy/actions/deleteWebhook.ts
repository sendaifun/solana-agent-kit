import { z } from "zod";
import { alchemyDeleteWebhook } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyDeleteWebhookAction: Action = {
  name: "ALCHEMY_DELETE_WEBHOOK",
  similes: ["alchemy delete webhook", "delete alchemy notify webhook"],
  description: "Deletes an Alchemy Notify webhook by ID",
  examples: [
    [
      {
        input: {
          webhookId: "wh_123",
        },
        output: {
          status: "success",
          result: {},
          message: "Alchemy webhook deleted.",
        },
        explanation: "Deletes the specified Alchemy webhook.",
      },
    ],
  ],
  schema: z.object({
    webhookId: z.string().min(1).describe("Alchemy webhook ID to delete"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await alchemyDeleteWebhook(agent, input.webhookId);

      return {
        status: "success",
        result,
        message: "Alchemy webhook deleted.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to delete Alchemy webhook: ${error.message}`,
      };
    }
  },
};

export default alchemyDeleteWebhookAction;
