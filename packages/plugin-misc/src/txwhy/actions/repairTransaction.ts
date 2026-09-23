import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { txwhyRepairTransaction } from "../tools";

const repairTransactionAction: Action = {
  name: "REPAIR_SOLANA_TRANSACTION",
  similes: [
    "repair transaction",
    "fix failed transaction",
    "why did my transaction fail",
    "diagnose transaction failure",
    "explain transaction error",
    "custom program error",
  ],
  description:
    "Find the exact reason a Solana transaction fails and get back a rebuilt, unsigned transaction that passes simulation. Give either the base64 of a transaction about to be sent (signed or unsigned) or the signature of one that already failed. Repairs compute budget, expired blockhash, priority fee and Jupiter slippage (fresh quote for the same trade, tolerance never widened). Anything else comes back as a diagnosis naming the failing instruction and the decoded error. No API key needed.",
  examples: [
    [
      {
        input: {
          signature:
            "5UfDuX7WXY6h6ZwNc5mWrVpgd8TsG3Mp6P1i2CjMK5VbD1QF9FeYXTbmaDf2TGLTt6SXjhDQGTCE6bGENn7WUEp6",
        },
        output: {
          status: "success",
          result: {
            status: "needs_requote",
            summary:
              "This transaction fails on slippage and needs a fresh quote.",
            cause: {
              title: "SlippageToleranceExceeded",
              code: "Custom(6001) - 0x1771",
            },
          },
          message: "Diagnosed: SlippageToleranceExceeded",
        },
        explanation:
          "Explain why a transaction that already landed on chain failed.",
      },
      {
        input: {
          transaction: "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...",
        },
        output: {
          status: "success",
          result: {
            status: "repaired",
            summary:
              "Repaired. 2 changes applied and the rebuilt transaction passes simulation.",
            changes: [
              { type: "compute_unit_limit", before: "100", after: "518" },
            ],
            repairedTransaction: "<base64, unsigned>",
            simulation: { passed: true, unitsConsumed: 450 },
          },
          message: "Repaired: 2 changes, passes simulation, verified locally",
        },
        explanation:
          "Repair a transaction before sending it. The rebuilt transaction is verified locally to only differ in compute budget, blockhash or an equivalent swap.",
      },
    ],
  ],
  schema: z
    .object({
      transaction: z
        .string()
        .optional()
        .describe(
          "Base64 serialized transaction, signed or unsigned. Use for a transaction about to be sent.",
        ),
      signature: z
        .string()
        .optional()
        .describe(
          "Signature (or explorer URL) of a transaction that already failed on chain.",
        ),
    })
    .refine((v) => Boolean(v.transaction) !== Boolean(v.signature), {
      message: "Provide exactly one of transaction or signature",
    }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await txwhyRepairTransaction(agent, {
        transaction: input.transaction,
        signature: input.signature,
      });
      const message =
        result.status === "repaired"
          ? `Repaired: ${result.changes.length} changes, passes simulation${result.verifiedLocally ? ", verified locally" : ""}`
          : `${result.status === "valid" ? "Already valid" : "Diagnosed"}: ${result.cause?.title ?? result.summary}`;
      return { status: "success", result, message };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to repair transaction: ${error.message}`,
      };
    }
  },
};

export default repairTransactionAction;
