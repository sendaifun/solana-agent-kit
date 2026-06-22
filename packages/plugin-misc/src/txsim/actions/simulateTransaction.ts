import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { simulateTransactionPreflight } from "../tools";

const simulateTransaction: Action = {
  name: "SIMULATE_TRANSACTION",
  description:
    "Simulate a serialized (base64) Solana transaction against current chain state before signing or sending it. Returns whether it would succeed, the compute units it would consume, and the program logs. Use this as a pre-flight check to avoid paying fees on transactions that would fail. Fail-safe: any deserialize or RPC error returns willSucceed=false.",
  similes: [
    "simulate a transaction before sending",
    "dry run a solana transaction",
    "pre-flight check a transaction",
    "will this transaction succeed",
  ],
  examples: [
    [
      {
        input: {
          transaction: "AQAAAAAAAAAAAA...base64SerializedTx...",
        },
        output: {
          status: "success",
          willSucceed: true,
          error: null,
          unitsConsumed: 4521,
          logs: ["Program 11111111111111111111111111111111 invoke [1]"],
          summary: "✅ transaction would succeed (4521 compute units)",
        },
        explanation:
          "Simulate a base64-serialized transaction to confirm it would succeed before signing and sending it",
      },
    ],
  ],
  schema: z.object({
    transaction: z
      .string()
      .describe("Base64-encoded serialized transaction to simulate"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { transaction } = input;
      const result = await simulateTransactionPreflight(agent, transaction);

      return {
        status: "success",
        ...result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to simulate transaction: ${error.message}`,
        code: error.code || "SIMULATE_TRANSACTION_FAILED",
      };
    }
  },
};

export default simulateTransaction;
