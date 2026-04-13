import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { moonpayGetTransaction } from "../tools/getTransaction";

const moonpayGetTransactionAction: Action = {
  name: "MOONPAY_GET_TRANSACTION",
  similes: [
    "check moonpay transaction",
    "moonpay transaction status",
    "get moonpay transaction details",
    "look up moonpay purchase",
  ],
  description:
    "Retrieve a MoonPay transaction by ID to check its status and details.",
  examples: [
    [
      {
        input: {
          transactionId: "f1e2d3c4-a5b6-7890-abcd-ef1234567890",
        },
        output: {
          status: "success",
          transaction: {
            id: "f1e2d3c4-a5b6-7890-abcd-ef1234567890",
            status: "completed",
            walletAddress: "...",
            baseCurrencyAmount: 100,
            quoteCurrencyAmount: 0.89,
            createdAt: "2024-01-01T00:00:00Z",
          },
        },
        explanation: "Retrieve a completed MoonPay transaction",
      },
    ],
  ],
  schema: z.object({
    transactionId: z
      .string()
      .min(1)
      .describe("MoonPay transaction ID (UUID format)"),
  }),
  handler: async (agent, input) => {
    try {
      const transaction = await moonpayGetTransaction(
        agent,
        input.transactionId,
      );
      return { status: "success", transaction };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};

export default moonpayGetTransactionAction;
