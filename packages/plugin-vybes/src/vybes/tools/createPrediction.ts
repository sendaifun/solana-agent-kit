const VYBES_API_URL = "https://vybes.fun";

export type VybesTemplateType =
  | "graduation" | "market_cap_target" | "multiplier"
  | "ath_flip" | "holder_count" | "volume_target";

export type VybesDuration = "24h" | "48h" | "7d" | "30d";

export interface CreatePredictionParams {
  wallet: string;
  tokenMint: string;
  question: string;
  templateType: VybesTemplateType;
  duration?: VybesDuration;
  metadata?: Record<string, any>;
}

export interface CreatePredictionResult {
  success: boolean;
  marketId: string;
  question: string;
  templateType: string;
  endTime: string;
  viewUrl: string;
}

/**
 * Create a prediction market on vybes.fun for a Solana token.
 * Free to create. Others can bet YES/NO with SOL. Auto-resolved by cron.
 *
 * Templates: graduation, market_cap_target, multiplier, ath_flip,
 * holder_count, volume_target.
 *
 * @param params - Wallet, token mint, question, template type, duration, metadata
 */
export async function createVybesPrediction(
  params: CreatePredictionParams,
): Promise<CreatePredictionResult> {
  const res = await fetch(`${VYBES_API_URL}/api/agent/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      wallet: params.wallet,
      tokenMint: params.tokenMint,
      question: params.question,
      templateType: params.templateType,
      duration: params.duration || "24h",
      metadata: params.metadata || {},
    }),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Prediction creation failed");
  }

  return {
    success: true,
    marketId: data.data.marketId,
    question: params.question,
    templateType: params.templateType,
    endTime: data.data.endTime,
    viewUrl: `${VYBES_API_URL}/predictions/${data.data.marketId}`,
  };
}
