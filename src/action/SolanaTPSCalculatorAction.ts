import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaTPSCalculatorAction: Action = {
  name: "solana_get_tps",
  similes: ["calculate_tps", "get_tps"],
  description: "Get the current TPS of the Solana network",
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                startTime: 1633046400,
                endTime: 1633046500,
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { tps: 1500 },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit) => {
    const tps = await agent.getTPS();
    return {
      success: true,
      data: {
        tps,
        network: "mainnet-beta"
      }
    };
  },

  validate: async () => true, // No input to validate
};
