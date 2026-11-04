import { Action } from "solana-agent-kit";
import { z } from "zod";
import { checkTokenRiskWithHaris } from "../tools";

const checkTokenRiskAction: Action = {
  name: "CHECK_SOLANA_TOKEN_RISK",
  similes: [
    "check token risk",
    "is this token safe",
    "token safety check",
    "scam check",
    "honeypot check",
  ],
  description:
    "Check a Solana token for scam / rug-pull risk with Haris Guardian before trading. Returns a 0-100 risk score (higher = riskier), a level (low/medium/high/critical) and plain-English red flags: mint/freeze authority, Token-2022 traps (permanent delegate, transfer hook/fee, pausable), holder concentration, liquidity, LP lock and a buy/sell simulation.",
  examples: [
    [
      {
        input: {
          mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        },
        output: {
          status: "success",
          score: 5,
          level: "low",
          verdict: "Low risk: no major red flags found.",
        },
        explanation: "Check BONK for rug-pull red flags before buying",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(32).max(44).describe("The token mint address"),
  }),
  handler: async (agent, input) => {
    try {
      const report = await checkTokenRiskWithHaris(agent, input.mint);
      return {
        status: "success",
        score: report.score,
        level: report.level,
        verdict: report.verdict,
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

export default checkTokenRiskAction;
