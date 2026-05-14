import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import confirmOrder from "../tools/confirm-order";

const confirmOrderAction: Action = {
  name: "CROSSMINT_CONFIRM_ORDER",
  similes: [
    "crossmint confirm order",
    "confirm amazon order",
    "confirm shopify order",
    "check order status",
    "confirm purchase",
    "order confirmation",
  ],
  description: `Confirm the status of a Crossmint Amazon or Shopify order by orderId. Optionally retry until confirmation. Returns order details and status.`,
  examples: [
    [
      {
        input: {
          orderId: "order_123",
          retryUptoConfirmation: true,
        },
        output: {
          status: "success",
          order: { orderId: "order_123" /* ... */ },
          message: "Order confirmed successfully",
        },
        explanation:
          "Confirm the status of order order_123, retrying until confirmed.",
      },
    ],
  ],
  schema: z.object({
    orderId: z.string().describe("Order ID to confirm"),
    retryUptoConfirmation: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to retry until confirmation"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const { orderId, retryUptoConfirmation } = input;
    try {
      const result = await confirmOrder(agent, orderId, retryUptoConfirmation);
      return { status: "success", ...result };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default confirmOrderAction;
