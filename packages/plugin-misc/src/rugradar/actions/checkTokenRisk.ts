import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { rugradarCheckToken } from "../tools";

const rugradarCheckTokenAction: Action = {
  name: "RUGRADAR_CHECK_TOKEN",
  similes: [
    "check token for rug",
    "is this token a rug",
    "rug check",
    "token risk score",
    "check pump fun token",
    "honeypot check",
  ],
  description:
    "Read-only rug and scam risk check for a Solana token via RugRadar. Accepts a mint address, a pump fun or DexScreener link, or a $TICKER. Returns a 0-100 risk score (0-29 low risk, 30-59 caution, 60-100 high risk), red flags (mint/freeze authority, Token-2022 extensions, holder concentration, dev wallet launch history, linked insider wallets, LP lock, honeypot sell test) and a report URL. Automated risk signals, not financial advice.",
  examples: [
    [
      {
        input: { query: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
        output: {
          status: "success",
          score: 0,
          risk_level: "Low risk",
          report_url:
            "https://rugradar-bgcm.onrender.com/t/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        },
        explanation: "Check BONK for rug risk before swapping into it",
      },
    ],
  ],
  schema: z.object({
    query: z
      .string()
      .min(2)
      .describe("Mint address, pump fun / DexScreener link, or $TICKER"),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const r = await rugradarCheckToken(agent, input.query);
      return {
        status: "success",
        mint: r.mint,
        symbol: r.symbol,
        score: r.score,
        risk_level: r.risk_level,
        summary: r.summary,
        flags: (r.flags || []).map((f: any) => `[${f.sev}] ${f.text}`),
        report_url: r.report_url,
        message: r.attribution?.cite,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `RugRadar check failed: ${error.message}`,
      };
    }
  },
};

export default rugradarCheckTokenAction;
