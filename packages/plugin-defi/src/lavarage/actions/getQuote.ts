import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageGetQuote } from "../tools";

export const lavarageGetQuoteAction: Action = {
  name: "LAVARAGE_GET_QUOTE",
  similes: ["get leverage quote", "preview trade", "check trade cost", "estimate leverage trade"],
  description: `Preview a leverage trade before executing. Shows expected output, price impact, and fees. Does NOT execute anything.

Use the same params (offerPublicKey, collateralAmount, leverage) for LAVARAGE_OPEN_POSITION to execute.`,
  examples: [[{
    input: { offerPublicKey: "CfiY...", collateralAmount: "5000000", leverage: 3 },
    output: { status: "success", quote: { outAmount: "15038", priceImpactPct: "0" } },
    explanation: "Preview a 3x trade with 5 USDC collateral.",
  }]],
  schema: z.object({
    offerPublicKey: z.string().describe("Offer public key from LAVARAGE_LIST_TOKENS"),
    collateralAmount: z.string().describe("Collateral in quote token smallest units"),
    leverage: z.number().min(1.1).max(12).describe("Leverage multiplier"),
    slippageBps: z.number().optional().default(50).describe("Slippage in bps"),
  }),
  handler: async (agent, input) => {
    try {
      const quote = await lavarageGetQuote(agent, input.offerPublicKey, input.collateralAmount, input.leverage, input.slippageBps);
      return { status: "success", quote };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};
