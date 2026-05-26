import { Action } from "solana-agent-kit";
import { z } from "zod";
import { fetchTokenDetailedReport } from "../tools";

// Strict Base58 Solana address regex
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const rugcheckDetailedAction: Action = {
  name: "RUGCHECK_DETAILED",
  description:
    "Get a detailed token safety, risk analysis, and rug check report including full owner, liquidity, and risk audit logs.",
  similes: [
    "detailed rug pull check",
    "get detailed token safety report",
    "check token risk details",
    "detailed rug check",
    "audit token safety",
  ],
  examples: [
    [
      {
        input: {
          mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        },
        output: {
          status: "success",
          score: 0,
          riskLevel: "Good",
          message:
            "🛡️ **Detailed Token Safety Audit**\nMint: `JUPyiwrYJFsk...`\nRisk Level: **Good** (Score: 0)\n\n✅ No critical or warning risks detected.",
        },
        explanation: "Fetch the detailed safety and risk report for JUP",
      },
    ],
  ],
  schema: z.object({
    mint: z
      .string()
      .trim()
      .regex(
        SOLANA_ADDRESS_REGEX,
        "Invalid Solana mint address format (must be Base58 and 32-44 characters)",
      )
      .describe("The token mint address to audit"),
  }),
  handler: async (_agent, input) => {
    try {
      const mint = input.mint as string;
      const report = await fetchTokenDetailedReport(mint);

      // Calculate risk classification
      let riskLevel: "Good" | "Warning" | "Danger" = "Good";
      if (report.score >= 3000) {
        riskLevel = "Danger";
      } else if (report.score >= 1000) {
        riskLevel = "Warning";
      }

      const emoji =
        riskLevel === "Good" ? "🛡️" : riskLevel === "Warning" ? "⚠️" : "🚨";

      const warnings = report.risks.filter((r) => r.level === "warning");
      const dangers = report.risks.filter((r) => r.level === "danger");

      let message = `${emoji} **Detailed Token Safety Audit**\n`;
      message += `Mint Address: \`${mint}\`\n`;
      message += `Risk Level: **${riskLevel}** (Score: ${report.score})\n`;
      message += `Token Program: \`${report.tokenProgram}\` | Type: \`${report.tokenType}\`\n\n`;

      if (dangers.length > 0) {
        message += "🔴 **CRITICAL RISKS DETECTED:**\n";
        for (const r of dangers) {
          message += `- **${r.name}** (Score: ${r.score}): ${r.description}\n`;
        }
        message += "\n";
      }

      if (warnings.length > 0) {
        message += "🟡 **WARNINGS DETECTED:**\n";
        for (const r of warnings) {
          message += `- **${r.name}** (Score: ${r.score}): ${r.description}\n`;
        }
        message += "\n";
      }

      if (dangers.length === 0 && warnings.length === 0) {
        message +=
          "✅ **No critical or warning risks detected.** The token contract and ownership distributions appear standard.\n";
      }

      return {
        status: "success",
        score: report.score,
        riskLevel,
        risks: report.risks,
        tokenProgram: report.tokenProgram,
        tokenType: report.tokenType,
        message,
      };
    } catch (error: any) {
      // Sanitize paths in error messages
      const safeErrorMsg = error.message.replace(/\/home\/[^/]+/g, "~");
      return {
        status: "error",
        message: `Detailed Rugcheck audit failed: ${safeErrorMsg}`,
      };
    }
  },
};

export default rugcheckDetailedAction;
