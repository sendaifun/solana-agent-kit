import { runEvals } from "../utils/runEvals";

const RAYDIUM_CREATE_CLMM_DATASET = [
  {
    inputs: {
      query:
        "Create Raydium CLMM with mint1 So11111111111111111111111111111111111111112, mint2 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, configId=DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm, initialPrice=0.25, startTime=1672531200",
    },
    referenceOutputs: {
      tool: "raydium_create_clmm",
      response: JSON.stringify({
        mint1: "So11111111111111111111111111111111111111112",
        mint2: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        configId: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
        initialPrice: 0.25,
        startTime: 1672531200,
      }),
    },
  },
];

runEvals(RAYDIUM_CREATE_CLMM_DATASET, "raydium_create_clmm eval");
