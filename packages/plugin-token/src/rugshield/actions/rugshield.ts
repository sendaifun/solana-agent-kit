import { Action } from "solana-agent-kit";
import { z } from "zod";
import { fetchRugshieldScan } from "../tools";

const rugshieldAction: Action = {
  name: "RUGSHIELD_AUDIT",
  description:
    "Inspect any Solana SPL token mint (or Base contract) for mint/freeze authority, DEX liquidity, and paid x402 swap simulation status via RugShield 402.",
  similes: [
    "audit token safety",
    "rugshield scan",
    "simulate token sell",
    "check honeypot tax",
    "pre trade audit",
    "verify token authority",
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
          response: {
            status: "not_performed",
            token_address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            chain: "solana",
            is_honeypot: null,
            recommendation: "INCONCLUSIVE_REQUIRES_SWAP_SIMULATION",
            payment_mode: "free_preview",
          },
        },
        explanation:
          "Inspect an SPL token mint using RugShield free preview before swapping or upgrade to paid /v1/scan with paymentSignature.",
      },
    ],
  ],
  schema: z.object({
    mint: z
      .string()
      .min(1)
      .describe("The SPL token mint (or Base token) address to audit"),
    chain: z
      .enum(["solana", "base"])
      .optional()
      .describe("Blockchain network (defaults to solana)"),
    paymentSignature: z
      .string()
      .optional()
      .describe(
        "Optional Base64 x402 v2 PAYMENT-SIGNATURE header to invoke paid /v1/scan instead of free /v1/scan/preview",
      ),
  }),
  handler: async (_agent, input) => {
    try {
      const res = await fetchRugshieldScan(input.mint, {
        chain: input.chain,
        paymentSignature: input.paymentSignature,
      });
      return {
        status: "success",
        response: res,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error?.message ?? String(error),
      };
    }
  },
};

export default rugshieldAction;
