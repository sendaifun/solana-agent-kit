import { z } from "zod";
import { Action } from "../../types";

const fetchIntmoltDeepAuditAction: Action = {
  name: "FETCH_INTMOLT_DEEP_AUDIT_ACTION",
  description:
    "Runs a deep multi-agent security audit for a Solana token using integrity.molt's swarm pipeline (scanner → analyst → reputation-agent → meta-scorecard). Returns an aggregate risk score (0–100), PASS/WARN/FAIL decision, per-agent reasoning, and an Ed25519-signed report verifiable at https://intmolt.org/verify.html. Requires INTMOLT_API_KEY environment variable.",
  similes: [
    "deep audit token with integrity.molt",
    "run intmolt deep scan",
    "get full token security audit",
    "integrity molt deep audit",
    "comprehensive token risk analysis",
    "multi-agent token audit",
  ],
  examples: [
    [
      {
        input: {
          mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        },
        output: {
          status: "complete",
          tier: "deep-audit",
          pipeline: "swarm",
          address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          decision: "PASS",
          aggregate_score: 12,
          agents: {
            scanner: {
              score: 10,
              confidence: 90,
              reason: "Fixed supply, no mint authority, wide distribution",
            },
            analyst: {
              score: 15,
              confidence: 85,
              analysis: "No red flags in token economics or contract behavior",
            },
            reputation: {
              score: 8,
              confidence: 95,
              flags: [],
            },
          },
          timestamp: "2026-03-31T10:00:00Z",
        },
        explanation:
          "Runs a deep multi-agent audit for BONK via integrity.molt swarm",
      },
    ],
  ],
  schema: z.object({
    mint: z
      .string()
      .min(32)
      .max(44)
      .describe("Solana token mint address (base58)"),
  }),
  handler: async (agent, input) => {
    try {
      const report = await agent.fetchIntmoltDeepAudit(input.mint);
      return {
        status: "success",
        result: report,
      };
    } catch (e: any) {
      return {
        status: "error",
        message: e.message,
      };
    }
  },
};

export default fetchIntmoltDeepAuditAction;
