import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { rugradarScanLink } from "../tools";

const rugradarScanLinkAction: Action = {
  name: "RUGRADAR_SCAN_LINK",
  similes: [
    "is this link a drainer",
    "check airdrop link",
    "phishing link check",
    "scan claim link",
  ],
  description:
    "Scans a URL or pasted post text for wallet-drainer and phishing patterns (fake claim or airdrop pages, lookalike domains, wallet-connect bait) using RugRadar. Use before connecting a wallet to an unfamiliar site.",
  examples: [
    [
      {
        input: { text: "https://claim-airdrop-solana.xyz" },
        output: { status: "success", score: 89, verdict: "Danger" },
        explanation: "Check an airdrop claim link before connecting a wallet",
      },
    ],
  ],
  schema: z.object({
    text: z.string().min(4).describe("URL or pasted post text"),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const r = await rugradarScanLink(agent, input.text);
      return {
        status: "success",
        score: r.score,
        verdict: r.verdict,
        summary: r.summary,
        flags: (r.flags || []).map((f: any) => `[${f.sev}] ${f.text}`),
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `RugRadar link scan failed: ${error.message}`,
      };
    }
  },
};

export default rugradarScanLinkAction;
