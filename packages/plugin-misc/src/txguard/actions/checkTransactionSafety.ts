import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { checkTransactionSafety } from "../tools";

const instructionSchema = z.object({
  program: z.string().describe("program id the instruction invokes"),
  type: z
    .string()
    .optional()
    .describe(
      "decoded instruction type, e.g. transfer / setAuthority / approve",
    ),
  dest: z.string().optional().describe("destination / new-authority pubkey"),
  delegate: z
    .string()
    .optional()
    .describe("delegate pubkey for token approvals"),
  new_authority: z
    .string()
    .optional()
    .describe("new authority/owner for setAuthority/assign"),
  owner: z
    .string()
    .optional()
    .describe("new owner program for a System assign"),
  amount: z
    .union([z.number(), z.string()])
    .optional()
    .describe(
      'lamports or token base units; "unlimited" or 2^64-1 ⇒ unlimited delegate',
    ),
  balance: z
    .number()
    .optional()
    .describe("fee-payer balance hint for full-drain detection"),
  drains_balance: z.boolean().optional(),
});

const checkTransactionSafetyAction: Action = {
  name: "CHECK_TRANSACTION_SAFETY",
  description:
    "Deterministically screen a decoded Solana transaction for known drain/seizure patterns BEFORE signing. " +
    "No model, no key, no network — pure structural analysis. Returns allow|warn|halt with per-rule reasons. " +
    "Catches: unknown program invokes, full-balance / split drains, setAuthority & closeAccount seizures, " +
    "assign-to-foreign-owner, and unlimited token delegates. Fail-safe: unknowns escalate to halt.",
  similes: [
    "check if this transaction is safe to sign",
    "screen transaction for drain patterns",
    "is this solana transaction a scam",
    "pre-sign safety check",
    "detect wallet drainer transaction",
  ],
  examples: [
    [
      {
        input: {
          fee_payer: "AgentWa11et1111111111111111111111111111111",
          owned_accounts: ["AgentWa11et1111111111111111111111111111111"],
          instructions: [
            {
              program: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              type: "approve",
              delegate: "Attacker11111111111111111111111111111111111",
              amount: "18446744073709551615",
            },
          ],
        },
        output: {
          status: "success",
          verdict: "halt",
          safe_to_sign: false,
          summary: "⛔ 1 halt · 0 warn — DO NOT auto-sign",
        },
        explanation:
          "An unlimited token delegate to an unknown spender is a drain-later attack — flagged halt.",
      },
    ],
  ],
  schema: z.object({
    fee_payer: z.string().optional().describe("fee payer / signer pubkey"),
    owned_accounts: z
      .array(z.string())
      .optional()
      .describe(
        "pubkeys the agent controls — payouts to anything else are suspect",
      ),
    balance: z
      .number()
      .optional()
      .describe("fee-payer lamport balance, for split-drain detection"),
    instructions: z
      .array(instructionSchema)
      .describe("decoded instructions of the transaction"),
  }),
  handler: async (_agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const verdict = checkTransactionSafety({
        fee_payer: input.fee_payer,
        owned_accounts: input.owned_accounts,
        balance: input.balance,
        instructions: input.instructions ?? [],
      });
      return {
        status: "success",
        ...verdict,
        message: verdict.summary,
      };
    } catch (error: any) {
      // Fail safe: never let an error read as "safe".
      return {
        status: "error",
        verdict: "halt",
        safe_to_sign: false,
        message: `Failed to check transaction safety: ${error.message}`,
        code: error.code || "CHECK_TRANSACTION_SAFETY_FAILED",
      };
    }
  },
};

export default checkTransactionSafetyAction;
