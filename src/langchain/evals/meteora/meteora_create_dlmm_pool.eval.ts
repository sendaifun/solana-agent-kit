import { runEvals } from "../utils/runEvals";

const METEORA_CREATE_DLMM_POOL_DATASET = [
  {
    inputs: {
      query:
        "Initialize a DLMM pool with tokenAMint=So11111111111111111111111111111111111111112, tokenBMint=DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm, binStep=20, initialPrice=0.5, feeBps=20, activationType=1, activationPoint=1680000123, hasAlphaVault=false",
    },
    referenceOutputs: {
      tool: "meteora_create_dlmm_pool",
      response: JSON.stringify({
        tokenAMint: "So11111111111111111111111111111111111111112",
        tokenBMint: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
        binStep: 20,
        initialPrice: 0.5,
        feeBps: 20,
        activationType: 1,
        activationPoint: 1680000123,
        hasAlphaVault: false,
      }),
    },
  },
];

runEvals(METEORA_CREATE_DLMM_POOL_DATASET, "meteora_create_dlmm_pool eval");
