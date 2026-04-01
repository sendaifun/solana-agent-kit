import { z } from "zod";
import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { createVybesPrediction } from "../tools/createPrediction";

const schema = z.object({
  tokenMint: z.string().describe("Solana token mint address"),
  question: z
    .string()
    .min(10)
    .max(200)
    .describe("Prediction question"),
  templateType: z
    .enum([
      "graduation",
      "market_cap_target",
      "multiplier",
      "ath_flip",
      "holder_count",
      "volume_target",
    ])
    .describe("Prediction template type"),
  duration: z
    .enum(["24h", "48h", "7d", "30d"])
    .optional()
    .describe("Duration (default: 24h)"),
  metadata: z
    .record(z.any())
    .optional()
    .describe("Template-specific metadata"),
});

const vybesPredictionAction: Action = {
  name: "CREATE_VYBES_PREDICTION",
  similes: [
    "create vybes prediction",
    "make prediction market",
    "start a bet on vybes",
    "create prediction on vybes.fun",
    "prediction market vybes",
  ],
  description:
    "Create a prediction market on vybes.fun for a Solana token. " +
    "Free to create. Others can bet YES/NO with SOL. Auto-resolved by cron. " +
    "Templates: graduation, market_cap_target, multiplier, ath_flip, holder_count, volume_target.",
  examples: [
    [
      {
        input: {
          tokenMint: "7nxQB...",
          question: "Will this token hit 100 SOL volume in 24h?",
          templateType: "volume_target",
          duration: "24h",
          metadata: { target_volume: 100 },
        },
        output: {
          status: "success",
          marketId: "market-123",
          viewUrl: "https://vybes.fun/predictions/market-123",
        },
        explanation:
          "Create a volume target prediction market with 24h duration",
      },
    ],
  ],
  schema,
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const wallet = agent.wallet.publicKey.toBase58();
      const result = await createVybesPrediction({
        wallet,
        tokenMint: input.tokenMint,
        question: input.question,
        templateType: input.templateType as any,
        duration: input.duration,
        metadata: input.metadata,
      });
      return {
        status: "success",
        marketId: result.marketId,
        viewUrl: result.viewUrl,
        message: `Created prediction: ${input.question}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Prediction creation failed: ${error.message}`,
      };
    }
  },
};

export default vybesPredictionAction;
export { vybesPredictionAction };
