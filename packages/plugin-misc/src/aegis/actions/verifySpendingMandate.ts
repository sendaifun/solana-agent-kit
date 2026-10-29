import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { verifySpendingMandate } from "../tools/verify_spending_mandate";

const verifySpendingMandateAction: Action = {
  name: "VERIFY_SPENDING_MANDATE",
  similes: [
    "check agent spending limit",
    "verify transaction mandate",
    "pre-flight firewall check",
    "validate agent transfer policy",
  ],
  description:
    "Pre-flight firewall check that validates whether a proposed Solana transfer complies with the agent's max single-transaction cap, recipient allowlist, and on-chain SOL balance before signing.",
  examples: [
    [
      {
        input: {
          recipient: "7xKp9mQa11111111111111111111111111111111111",
          amountSol: 0.5,
          maxSingleTxSol: 1.0,
        },
        output: {
          status: "success",
          allowed: true,
          reason: "Transaction satisfies all Aegis spending mandate policies.",
        },
        explanation:
          "Verifies that sending 0.5 SOL is within the 1.0 SOL single-transaction mandate cap and that the wallet has sufficient SOL.",
      },
    ],
  ],
  schema: z.object({
    recipient: z
      .string()
      .min(32)
      .describe("Recipient Solana wallet address (base58)"),
    amountSol: z
      .number()
      .positive()
      .describe("Proposed transfer amount in SOL"),
    maxSingleTxSol: z
      .number()
      .positive()
      .describe("Maximum allowed SOL per transaction"),
    allowedRecipients: z
      .array(z.string())
      .optional()
      .describe("Optional list of allowlisted recipient addresses"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await verifySpendingMandate(agent, {
        recipient: input.recipient,
        amountSol: input.amountSol,
        maxSingleTxSol: input.maxSingleTxSol,
        allowedRecipients: input.allowedRecipients,
      });
      return {
        status: "success",
        ...result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default verifySpendingMandateAction;
