import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaGetWalletAddressAction: Action = {
  name: "solana_get_wallet_address",
  similes: ["get_wallet_address", "fetch_wallet_address"],
  description: "Get the wallet address of the agent",
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: "",
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            walletAddress: "So11111111111111111111111111111111111111112",
          },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit) => {
    return {
      success: true,
      data: {
        walletAddress: agent.wallet_address.toString()
      }
    };
  },

  validate: async () => true, // No input to validate
};
