import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { txwhySendWithRepair } from "../tools";

const sendWithRepairAction: Action = {
  name: "SEND_TRANSACTION_WITH_REPAIR",
  similes: [
    "send with repair",
    "send transaction and fix it if it fails",
    "retry failed transaction with a fix",
    "send this transaction reliably",
  ],
  description:
    "Simulate a transaction, repair it if it would fail (compute budget, expired blockhash, priority fee, stale Jupiter quote), verify the repair locally, then sign with the wallet and send. If it passes as built it is sent unchanged and no external service is contacted. A repair is refused unless it keeps the same fee payer, the same signers and every other instruction byte for byte.",
  examples: [
    [
      {
        input: {
          transaction: "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...",
        },
        output: {
          status: "success",
          signature:
            "3KfW7bVQ7jJ6f2vD9qR1k8tX4nM2sL5cP8wA1yB6zE9hG4uH7iJ2kL3mN4oP5qR6sT7uV8wX9yZ1aB2cD3eF4gH5",
          repairs: 1,
          message: "Sent after 1 repair (swap_quote, compute_unit_limit)",
        },
        explanation:
          "The swap was built on a stale quote. It was rebuilt with a fresh quote for the same trade, verified locally, signed and sent.",
      },
    ],
  ],
  schema: z.object({
    transaction: z
      .string()
      .min(1)
      .describe("Base64 serialized transaction to send, signed or unsigned"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { signature, signedTransaction, repairs } =
        await txwhySendWithRepair(agent, input.transaction);
      const applied = repairs
        .flatMap((r) => r.changes.map((c) => c.type))
        .join(", ");
      let message = "Signed (signOnly), not sent";
      if (signature) {
        message = repairs.length
          ? `Sent after ${repairs.length} repair (${applied})`
          : "Sent as built, no repair needed";
      }
      return {
        status: "success",
        signature,
        signedTransaction: signedTransaction
          ? Buffer.from(signedTransaction.serialize()).toString("base64")
          : undefined,
        repairs: repairs.length,
        message,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to send transaction: ${error.message}`,
      };
    }
  },
};

export default sendWithRepairAction;
