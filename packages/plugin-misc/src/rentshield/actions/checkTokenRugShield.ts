import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { rentshieldCheckToken } from "../tools";

const rentshieldCheckTokenAction: Action = {
  name: "RENTSHIELD_CHECK_TOKEN",
  similes: [
    "check token rug shield",
    "11 layer rug check",
    "pre buy token audit",
    "is this solana token safe to buy",
    "check token2022 hooks",
  ],
  description:
    "Read-only 11-layer pre-buy rug and scam audit for a Solana token mint via Rent & Rug Shield (https://rentandrugshield.com). Evaluates mint/freeze authorities, Token-2022 permanent delegate and transfer hook traps, LP lock/burn verification, holder concentration, and Block-0 Sybil clusters. Accepts only a public base58 mint address; never pass private keys.",
  examples: [
    [
      {
        input: {
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          symbol: "USDC",
          score: 100,
          safeToBuy: true,
          layersChecked: 11,
          reportUrl:
            "https://rentandrugshield.com/audit/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        explanation:
          "Run an 11-layer pre-buy safety check on USDC before executing a swap",
      },
    ],
  ],
  schema: z.object({
    mint: z
      .string()
      .min(32)
      .max(44)
      .describe(
        "Public base58 Solana token mint address. Never pass private keys or seed phrases.",
      ),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const report = await rentshieldCheckToken(agent, input.mint);
      return {
        status: "success",
        ...report,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Rent & Rug Shield token check failed: ${error.message}`,
      };
    }
  },
};

export default rentshieldCheckTokenAction;
