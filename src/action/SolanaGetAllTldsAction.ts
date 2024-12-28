import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaGetAllTldsAction: Action = {
  name: "solana_get_all_tlds",
  similes: ["get_all_tlds", "fetch_all_tlds"],
  description: "Get all active top-level domains (TLDs) in the AllDomains Name Service",
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: { text: "" },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { tlds: ["sol", "bonk", "blink"] }
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit) => {
    const tlds = await agent.getAllDomainsTLDs();
    return {
      success: true,
      data: {
        tlds
      }
    };
  },

  validate: async () => true, // No input to validate
};
