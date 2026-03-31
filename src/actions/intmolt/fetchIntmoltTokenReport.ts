import { z } from "zod";
import { Action } from "../../types";

const fetchIntmoltTokenReportAction: Action = {
  name: "FETCH_INTMOLT_TOKEN_REPORT_ACTION",
  description:
    "Fetches a security report for a Solana token from integrity.molt. Works for any valid mint address — including brand-new pump.fun tokens — by querying Solana mainnet directly. Returns on-chain risk signals (mint authority, freeze authority, supply concentration) plus an AI-generated assessment and an Ed25519-signed report.",
  similes: [
    "check token safety with integrity.molt",
    "scan token for rug pull",
    "get intmolt security report",
    "check if token is safe",
    "integrity molt token scan",
    "check token risk",
    "scan solana token",
  ],
  examples: [
    [
      {
        input: {
          mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        },
        output: {
          status: "complete",
          address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          report:
            "**BONK Token Security Assessment**\n\nRisk Level: LOW\n\nThe BONK token (DezXAZ8z...) shows no critical on-chain risk signals. Mint authority is disabled — supply is fixed. Freeze authority is not set. Top holder controls 0.8% of supply, indicating healthy distribution across 180,000+ wallets.\n\nRecommendation: Low risk for standard use cases.",
          signed: {
            report: "...",
            signature: "...",
            public_key: "xs0YPIxV60Bxhe+66K8PuA5cSAwQwlsISUhU/vlsYJg=",
            key_id: "xs0YPIxV60Bx",
            signed_at: "2026-03-31T10:00:00Z",
          },
          timestamp: "2026-03-31T10:00:00Z",
        },
        explanation:
          "Fetches a security report for the BONK token from integrity.molt",
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
      const report = await agent.fetchIntmoltTokenReport(input.mint);
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

export default fetchIntmoltTokenReportAction;
