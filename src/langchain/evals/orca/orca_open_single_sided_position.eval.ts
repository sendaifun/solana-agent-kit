import { runEvals } from "../utils/runEvals";

const ORCA_OPEN_SINGLE_SIDED_POSITION_DATASET = [
  {
    inputs: {
      query:
        "Open single-sided position in whirlpool DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm with 200 deposit of mint So11111111111111111111111111111111111111112, 200 bps distance, 400 bps width",
    },
    referenceOutputs: {
      tool: "orca_open_single_sided_position",
      response: JSON.stringify({
        whirlpoolAddress: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
        distanceFromCurrentPriceBps: 200,
        widthBps: 400,
        inputTokenMint: "So11111111111111111111111111111111111111112",
        inputAmount: 200,
      }),
    },
  },
];

runEvals(
  ORCA_OPEN_SINGLE_SIDED_POSITION_DATASET,
  "orca_open_single_sided_position eval",
);
