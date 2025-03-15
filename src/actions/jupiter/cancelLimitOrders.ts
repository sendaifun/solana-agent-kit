import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { cancelLimitOrders } from "../../tools/jupiter/cancel_limit_orders";

const cancelOrdersSchema = z.object({
  orders: z.array(z.string()).describe("The order public keys to cancel"),
});

const cancelOrdersAction: Action = {
  name: "CANCEL_LIMIT_ORDERS",
  similes: [
    "abort orders",
    "cancel limit order",
    "revoke orders",
    "terminate orders",
  ],
  description: "Cancels specified orders on the Solana blockchain.",
  examples: [
    [
      {
        input: {
          orders: ["GgMvwcfMz...ienihZvTmyBZYM", "HhNvwcfMz...Qa8ihZvTmyBZYN"],
        },
        output: {
          signatures: ["5K3N9...3J4", "6L4O0...4K5"],
          success: true,
          explanation: "Orders canceled successfully.",
        },
        explanation: "Successfully canceled the specified orders.",
      },
      {
        input: {
          orders: ["InvalidOrderKey"],
        },
        output: {
          signatures: [],
          success: false,
          error: "Error canceling orders: Invalid order key",
          explanation: "Failed to cancel orders due to invalid order key.",
        },
        explanation: "Failed to cancel orders due to an invalid order key.",
      },
    ],
  ],
  schema: cancelOrdersSchema,
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const params = cancelOrdersSchema.parse(input);

    try {
      const result = await cancelLimitOrders(agent, params);

      return {
        status: "success",
        result,
        message: "Orders canceled successfully.",
      };
    } catch (error) {
      const errorMessage = `Error canceling orders: ${error}`;
      console.error(errorMessage);
      return {
        status: "error",
        message: errorMessage,
      };
    }
  },
};

export default cancelOrdersAction;
