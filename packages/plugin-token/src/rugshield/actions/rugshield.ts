import { Action } from "solana-agent-kit";
import { z } from "zod";
import { fetchRugshieldScan } from "../tools";

const rugshieldAction: Action = {
  name: "RUGSHIELD_AUDIT",
  description:
    "Audit any Solana SPL token mint for honeypot traps, simulation sell restrictions, buy/sell tax, liquidity health, and sybil dev-clusters via RugShield 402.",
  similes: [
    "audit token safety",
    "rugshield scan",
    "simulate token sell",
    "check honeypot tax",
    "pre trade audit",
    "verify token liquidity lock",
    "check token rug pull",
  ],
  examples: [
    [
      {
        input: {
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          is_honeypot: false,
          recommendation: "SAFE_TO_SWAP",
          message:
            "Token passed RugShield pre-trade simulation with 0% tax and healthy liquidity.",
        },
        explanation:
          "Audit USDC SPL token mint before executing a swap or transfer.",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(1).describe("The SPL token mint address to audit"),
  }),
  handler: async (_agent, input) => {
    try {
      const res = await fetchRugshieldScan(input.mint);
      return {
        status: "success",
        response: res,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default rugshieldAction;
