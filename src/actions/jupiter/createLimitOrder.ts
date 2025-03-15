import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { createLimitOrder } from "../../tools/jupiter/create_limit_order";

const createLimitOrderSchema = z.object({
  inputMint: z.string(),
  outputMint: z.string(),
  params: z.object({
    makingAmount: z.string(),
    takingAmount: z.string(),
    expiredAt: z.string().optional(),
  }),
});

export const createLimitOrderAction: Action = {
  name: "CREATE_LIMIT_ORDER",
  similes: ["place limit order", "submit limit order", "create trading order"],
  description: "Creates and sends a limit order on the Solana blockchain.",
  examples: [
    [
      {
        input: {
          inputAmount: "5500000",
          outputAmount: "50000000",
        },
        output: {
          signature: "5K3N9...3J4",
          order: "order123",
          success: true,
          explanation: "Order created and sent successfully.",
        },
        explanation:
          "Successfully created a limit order with specified amounts.",
      },
      {
        input: {
          inputAmount: "1000000",
          outputAmount: "20000000",
        },
        output: {
          signature: "",
          order: "",
          success: false,
          error: "Error creating and sending limit order: Network error",
          explanation: "Failed to create and send the order.",
        },
        explanation: "Failed to create a limit order due to a network error.",
      },
    ],
  ],
  schema: createLimitOrderSchema,
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const params = createLimitOrderSchema.parse(input);

    try {
      const result = await createLimitOrder(agent, params);

      return {
        status: "success",
        result,
        message: `Order created and sent successfully.`,
      };
    } catch (error) {
      return {
        status: "error",
        message: `Failed to create limit order: ${error}`,
      };
    }
  },
};

export default createLimitOrderAction;
