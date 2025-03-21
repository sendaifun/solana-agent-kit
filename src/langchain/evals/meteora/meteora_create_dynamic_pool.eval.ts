import { runEvals } from "../utils/runEvals";

const METEORA_CREATE_DYNAMIC_POOL_DATASET = [
  {
    inputs: {
      query:
        "Create Meteora dynamic pool with tokenAMint=So11111111111111111111111111111111111111112, tokenBMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, tokenAAmount=100, tokenBAmount=200, tradeFeeNumerator=2500, activationPoint=1680000000, hasAlphaVault=true",
    },
    referenceOutputs: {
      tool: "meteora_create_dynamic_pool",
      response: JSON.stringify({
        tokenAMint: "So11111111111111111111111111111111111111112",
        tokenBMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        tokenAAmount: 100,
        tokenBAmount: 200,
        tradeFeeNumerator: 2500,
        activationPoint: 1680000000,
        hasAlphaVault: true,
      }),
    },
  },
];

runEvals(
  METEORA_CREATE_DYNAMIC_POOL_DATASET,
  "meteora_create_dynamic_pool eval",
);
