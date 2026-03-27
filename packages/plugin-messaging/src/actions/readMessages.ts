import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { readMessages } from "../shared";

const readMessagesAction: Action = {
  name: "DESIDE_READ_MESSAGES",
  similes: [
    "read deside messages",
    "show conversation messages",
    "fetch dm history",
  ],
  description: "Read messages from a Deside conversation.",
  examples: [
    [
      {
        input: {
          convId: "walletA:walletB",
          limit: 20,
        },
        output: {
          status: "success",
          messages: [],
        },
        explanation: "Read recent messages from a Deside conversation.",
      },
    ],
  ],
  schema: z.object({
    convId: z.string().describe("Canonical conversation id returned by Deside."),
    limit: z.number().int().positive().optional().describe("Maximum number of messages to return."),
    beforeSeq: z.number().int().positive().optional().describe("Read messages older than this sequence number."),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const messages = await readMessages(agent, {
        convId: input.convId,
        limit: input.limit,
        beforeSeq: input.beforeSeq,
      });
      return {
        status: "success",
        messages,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to read Deside messages: ${error.message}`,
      };
    }
  },
};

export default readMessagesAction;
