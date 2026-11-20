import { Action } from "solana-agent-kit";
import { z } from "zod";
import { scanSolanaTokenWithNullClear } from "../tools";

const nullclearScanTokenAction: Action = {
  name: "NULLCLEAR_SCAN_SOLANA_TOKEN",
  similes: [
    "nullclear scan token",
    "check token-2022 transfer hook",
    "audit solana token safety",
    "check mint and freeze authority",
    "pre-trade honeypot scan",
    "nullclear token firewall",
  ],
  description:
    "Audit a Solana SPL or Token-2022 mint with the NullClear Pre-Execution Firewall before swapping. Checks active mint/freeze authorities, malicious Token-2022 extensions (TransferHook, PermanentDelegate), liquidity depth, and rug indicators, returning an explicit recommendedAgentAction (EXECUTE_SAFE, CAUTION_HIGH_RISK, or ABORT_CRITICAL_TRAP).",
  examples: [
    [
      {
        input: {
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          recommendedAgentAction: "EXECUTE_SAFE",
          safetyVerdict: "SAFE",
          riskScore: 0,
        },
        explanation:
          "Audit USDC on Solana with NullClear before executing a Jupiter swap",
      },
    ],
  ],
  schema: z.object({
    mint: z
      .string()
      .min(32)
      .max(44)
      .describe("The Solana SPL or Token-2022 mint address (Base58)"),
  }),
  handler: async (agent, input) => {
    try {
      const report = await scanSolanaTokenWithNullClear(agent, input.mint);
      return {
        status: "success",
        recommendedAgentAction: report.recommendedAgentAction,
        safetyVerdict: report.safetyVerdict,
        riskScore: report.riskScore,
        isSafe: report.isSafe,
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

export default nullclearScanTokenAction;
