import { z } from "zod";
import { listConversations } from "../shared";
import type { PluginAction, SolanaAgentLike } from "../types";

const listConversationsAction: PluginAction = {
  name: "DESIDE_LIST_CONVERSATIONS",
  similes: [
    "list my deside conversations",
    "show deside conversations",
    "view deside inbox",
  ],
  description: "List active Deside conversations for the connected wallet.",
  examples: [
    [
      {
        input: {
          limit: 10,
        },
        output: {
          status: "success",
          conversations: [],
        },
        explanation: "List the most recent Deside conversations.",
      },
    ],
  ],
  schema: z.object({
    limit: z.number().int().positive().optional().describe("Maximum number of conversations to return."),
    cursor: z.string().optional().describe("Pagination cursor returned by a previous call."),
  }),
  handler: async (agent: SolanaAgentLike, input: Record<string, any>) => {
    try {
      const conversations = await listConversations(agent, {
        limit: input.limit,
        cursor: input.cursor,
      });
      return {
        status: "success",
        conversations,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to list Deside conversations: ${error.message}`,
      };
    }
  },
};

export default listConversationsAction;
