import { Action } from "solana-agent-kit";
import { z } from "zod";
import { guardSolanaTxWithNullClear } from "../tools";

const nullclearGuardTxAction: Action = {
  name: "NULLCLEAR_GUARD_SOLANA_TX",
  similes: [
    "nullclear preflight guard",
    "simulate solana transaction safety",
    "guard solana swap before signing",
    "decode and simulate solana wire tx",
    "pre-sign solana firewall",
  ],
  description:
    "Run NullClear's 1-call Pre-Sign Firewall (POST /v1/guard) on a Solana token mint or base64 wire transaction before signing or broadcasting. Unwraps instructions, executes simulateTransaction preflight, audits touched SPL / Token-2022 mints for transfer hooks and freeze authorities, and returns recommendedAgentAction (EXECUTE_SAFE, CAUTION_HIGH_RISK, ABORT_CRITICAL_TRAP, ABORT_DRAINER_APPROVAL, or ABORT_WILL_REVERT).",
  examples: [
    [
      {
        input: {
          tokenAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        },
        output: {
          status: "success",
          recommendedAgentAction: "EXECUTE_SAFE",
          safetyVerdict: "SAFE",
          isSafe: true,
        },
        explanation:
          "Run a pre-sign NullClear firewall check on BONK before executing a trade",
      },
    ],
  ],
  schema: z.object({
    tokenAddress: z
      .string()
      .min(32)
      .max(44)
      .optional()
      .describe("Target Solana SPL or Token-2022 mint address"),
    rawTransactionBase64: z
      .string()
      .min(16)
      .optional()
      .describe(
        "Optional base64-encoded serialized Solana transaction to decode and simulate before signing",
      ),
  }),
  handler: async (agent, input) => {
    try {
      const report = await guardSolanaTxWithNullClear(agent, {
        tokenAddress: input.tokenAddress,
        rawTransactionBase64: input.rawTransactionBase64,
      });
      return {
        status: "success",
        recommendedAgentAction: report.recommendedAgentAction,
        safetyVerdict: report.safetyVerdict,
        isSafe: report.isSafe,
        riskScore: report.riskScore,
        summary: report.summary,
        riskFlags: report.riskFlags,
        report,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default nullclearGuardTxAction;
