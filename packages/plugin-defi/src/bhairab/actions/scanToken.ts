import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { scanToken } from "../tools/scan_token";

const scanTokenAction: Action = {
  name: "BHAIRAB_SCAN_TOKEN",
  description:
    "Scan a Solana token for risk BEFORE trading it. Returns a verdict (proceed, caution, or stop) with cited reasons, based on live market signals (liquidity, 24h price move, volume, token age). Use this as a safety check before any buy/swap to avoid illiquid, crashing, or scam tokens. Works without an API key; BHAIRAB_API_KEY unlocks an AI-reasoned verdict.",
  similes: [
    "check if a token is safe before buying",
    "is this token a scam or rug",
    "risk check this token",
    "scan token before trading",
    "should I buy this token",
    "pre-trade safety check",
  ],
  examples: [
    [
      {
        input: {
          token: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          action: "buy",
          amountUsd: 250,
        },
        output: {
          status: "success",
          verdict: "proceed",
          confidence: 0.8,
          summary:
            "Established token with deep liquidity and no red flags in market data.",
          reasons: [
            "High liquidity reduces slippage and exit risk",
            "Token is well-established (over 800 days old)",
          ],
          tier: "free",
        },
        explanation:
          "Scan a token for risk before buying; the verdict came back proceed.",
      },
    ],
    [
      {
        input: {
          token: "So11111111111111111111111111111111111111112",
        },
        output: {
          status: "success",
          verdict: "proceed",
          confidence: 1,
          summary: "Wrapped SOL — highly liquid, established asset.",
          reasons: ["no_red_flags_in_market_data"],
          tier: "free",
        },
        explanation: "Scan with only a mint address, defaulting action to buy.",
      },
    ],
  ],
  schema: z.object({
    token: z.string().describe("The Solana token mint address to scan"),
    action: z
      .enum(["buy", "sell", "swap", "transfer"])
      .optional()
      .describe("The intended action (defaults to buy)"),
    amountUsd: z
      .number()
      .optional()
      .describe("Optional intended amount in USD, for context"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await scanToken(
        agent,
        input.token,
        input.action ?? "buy",
        input.amountUsd,
      );

      return {
        status: "success",
        verdict: result.verdict,
        confidence: result.confidence,
        summary: result.summary,
        reasons: result.reasons,
        signals: result.signals,
        tier: result.tier,
        message: `Risk verdict: ${result.verdict.toUpperCase()} — ${result.summary}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to scan token: ${error.message}`,
        code: error.code || "BHAIRAB_SCAN_FAILED",
      };
    }
  },
};

export default scanTokenAction;
