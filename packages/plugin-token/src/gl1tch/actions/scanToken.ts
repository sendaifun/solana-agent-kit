import { Action } from "solana-agent-kit";
import { z } from "zod";
import { gl1tchTokenScan } from "../tools";

const gl1tchScanTokenAction: Action = {
  name: "GL1TCH_TOKEN_SCAN",
  description:
    "Scan a Solana token for honeypots, rug-pull risks, mint/freeze authorities, LP lock status, holder concentration, and deployer reputation before swapping or buying.",
  similes: [
    "gl1tch scan",
    "scan token safety",
    "check token rug pull",
    "verify token risk",
    "token honeypot check",
    "audit token safety",
  ],
  examples: [
    [
      {
        input: {
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          score: 90,
          verdict: "CLEAN",
          message: "Token is verified safe with low rug risk.",
        },
        explanation:
          "Scan USDC mint to ensure it has low risk before executing trade",
      },
    ],
  ],
  schema: z.object({
    mint: z
      .string()
      .min(1)
      .describe("The Solana token mint address to analyze"),
  }),
  handler: async (_agent, input) => {
    try {
      const report = await gl1tchTokenScan(input.mint);
      return {
        status: "success",
        verdict: report.verdict,
        score: report.score,
        response: report,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default gl1tchScanTokenAction;
