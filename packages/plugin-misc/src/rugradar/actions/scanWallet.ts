import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { rugradarScanWallet } from "../tools";

const rugradarScanWalletAction: Action = {
  name: "RUGRADAR_SCAN_WALLET",
  similes: [
    "scan wallet for risky tokens",
    "which tokens in this wallet are rugs",
    "wallet risk scan",
  ],
  description:
    "Lists the SPL tokens held by a public Solana wallet, riskiest first, with a RugRadar risk score and top red flags for each (free tier shows the 3 riskiest). Never pass a private key.",
  examples: [
    [
      {
        input: { address: "<public Solana wallet address>" },
        output: { status: "success", tokens: 12, high_risk: 3 },
        explanation: "Find the riskiest holdings in a public wallet",
      },
    ],
  ],
  schema: z.object({
    address: z
      .string()
      .min(32)
      .max(44)
      .describe("Public Solana wallet address"),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const r = await rugradarScanWallet(agent, input.address);
      return {
        status: "success",
        tokens: r.counts?.tokens,
        high_risk: r.counts?.high_risk,
        riskiest: r.tokens,
        limited: r.limited,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `RugRadar wallet scan failed: ${error.message}`,
      };
    }
  },
};

export default rugradarScanWalletAction;
