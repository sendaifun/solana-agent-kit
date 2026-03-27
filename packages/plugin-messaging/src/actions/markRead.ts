import { z } from "zod";
import { markRead } from "../shared";
import type { PluginAction, SolanaAgentLike } from "../types";

const markReadAction: PluginAction = {
  name: "DESIDE_MARK_READ",
  similes: [
    "mark deside conversation as read",
    "mark dm as read",
    "acknowledge conversation read",
  ],
  description: "Mark a Deside conversation as read up to a sequence number.",
  examples: [
    [
      {
        input: {
          convId: "walletA:walletB",
          seq: 12,
        },
        output: {
          status: "success",
          result: {
            ok: true,
          },
        },
        explanation: "Mark a conversation as read on Deside.",
      },
    ],
  ],
  schema: z.object({
    convId: z.string().describe("Canonical conversation id returned by Deside."),
    seq: z.number().int().positive().describe("Sequence number to mark as read."),
    readAt: z.string().optional().describe("Optional ISO timestamp to forward to Deside."),
  }),
  handler: async (agent: SolanaAgentLike, input: Record<string, any>) => {
    try {
      const result = await markRead(agent, {
        convId: input.convId,
        seq: input.seq,
        readAt: input.readAt,
      });
      return {
        status: "success",
        result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to mark Deside conversation as read: ${error.message}`,
      };
    }
  },
};

export default markReadAction;
