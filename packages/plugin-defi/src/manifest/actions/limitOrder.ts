import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { limitOrder } from "../tools";

const limitOrderAction: Action = {
  name: "PLACE_MANIFEST_LIMIT_ORDER",
  similes: [
    "place limit order",
    "create limit order",
    "set limit order",
    "place manifest order",
    "create manifest order",
    "manifest limit trade",
  ],
  description: "Place a limit order on a Manifest market",
  examples: [
    [
      {
        input: {
          marketId: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          quantity: 1.5,
          side: "Buy",
          price: 25.5,
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully placed limit order",
        },
        explanation: "Place a buy limit order for 1.5 tokens at price 25.5",
      },
    ],
  ],
  schema: z.object({
    marketId: z.string().min(32, "Invalid market ID"),
    quantity: z.number().positive("Quantity must be positive"),
    side: z.enum(["Buy", "Sell"]),
    price: z.number().positive("Price must be positive"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const transaction = await limitOrder(
        agent,
        new PublicKey(input.marketId),
        input.quantity,
        input.side,
        input.price,
      );

      return {
        status: "success",
        transaction,
        message: `Successfully placed ${input.side.toLowerCase()} limit order for ${input.quantity} tokens at ${input.price}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to place limit order: ${error.message}`,
      };
    }
  },
};

export default limitOrderAction;
