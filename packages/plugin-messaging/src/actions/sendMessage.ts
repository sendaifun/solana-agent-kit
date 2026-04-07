import { z } from "zod";
import { sendMessage } from "../shared";
import type { PluginAction, SolanaAgentLike } from "../types";

const sendMessageAction: PluginAction = {
  name: "DESIDE_SEND_MESSAGE",
  similes: [
    "send deside message",
    "send direct message",
    "dm a wallet on deside",
  ],
  description: "Send a direct message to another wallet through Deside.",
  examples: [
    [
      {
        input: {
          toWallet: "Gwrn3UyMvrdSP8VsQZyTfAYp9qwrcu5ivBujKHufZJFZ",
          text: "GM",
        },
        output: {
          status: "success",
          result: {
            status: "delivered",
          },
        },
        explanation: "Send a direct message to another wallet on Deside.",
      },
    ],
  ],
  schema: z.object({
    toWallet: z.string().describe("Destination wallet address."),
    text: z.string().min(1).describe("Message body to send."),
  }),
  handler: async (agent: SolanaAgentLike, input: Record<string, any>) => {
    try {
      const result = await sendMessage(agent, {
        toWallet: input.toWallet,
        text: input.text,
      });
      return {
        status: "success",
        result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to send Deside message: ${error.message}`,
      };
    }
  },
};

export default sendMessageAction;
