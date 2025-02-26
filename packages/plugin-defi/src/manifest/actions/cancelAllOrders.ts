import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { cancelAllOrders } from "../tools";

const cancelAllOrdersAction: Action = {
  name: "CANCEL_ALL_MANIFEST_ORDERS",
  similes: [
    "cancel all orders",
    "cancel manifest orders",
    "remove all orders",
    "clear manifest orders",
    "cancel open orders",
    "clear all orders",
  ],
  description: "Cancel all open orders on a Manifest market",
  examples: [
    [
      {
        input: {
          marketId: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully cancelled all orders",
        },
        explanation: "Cancel all open orders on the specified market",
      },
    ],
  ],
  schema: z.object({
    marketId: z.string().min(32, "Invalid market ID"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const transaction = await cancelAllOrders(
        agent,
        new PublicKey(input.marketId),
      );

      return {
        status: "success",
        transaction,
        message: "Successfully cancelled all orders",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to cancel orders: ${error.message}`,
      };
    }
  },
};

export default cancelAllOrdersAction;
