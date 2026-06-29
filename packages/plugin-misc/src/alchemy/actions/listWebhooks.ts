import { z } from "zod";
import { alchemyListWebhooks } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyListWebhooksAction: Action = {
  name: "ALCHEMY_LIST_WEBHOOKS",
  similes: ["alchemy list webhooks", "get alchemy webhooks"],
  description: "Lists Alchemy Notify webhooks for the configured team",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          webhooks: [],
          message: "Alchemy webhooks fetched.",
        },
        explanation: "Lists existing Alchemy Notify webhooks.",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => {
    try {
      const webhooks = await alchemyListWebhooks(agent);

      return {
        status: "success",
        webhooks,
        message: "Alchemy webhooks fetched.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to list Alchemy webhooks: ${error.message}`,
      };
    }
  },
};

export default alchemyListWebhooksAction;
