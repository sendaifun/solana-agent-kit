import { runEvals } from "../utils/runEvals";

const ORCA_CENTERED_POSITION_DATASET = [
  {
    inputs: {
      query:
        "Open a centered position in the Orca whirlpool 9XHgUXB8vHdfx81gpmLewyYaybrqQArM8fgTY7MbzR45 with price offset 300 bps, deposit 100 USDC with mint address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
    referenceOutputs: {
      tool: "orca_open_centered_position_with_liquidity",
      response: JSON.stringify({
        whirlpoolAddress: "9XHgUXB8vHdfx81gpmLewyYaybrqQArM8fgTY7MbzR45",
        priceOffsetBps: 300,
        inputTokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        inputAmount: 100,
      }),
    },
  },
  {
    inputs: {
      query:
        "Add liquidity at 5% offset in the Orca whirlpool Gg2oC3dxtZP6HZSQ7ZqWjBkeV2g1rFDMKVeKdv7LjKt8, deposit 50 of mint So11111111111111111111111111111111111111112",
    },
    referenceOutputs: {
      tool: "orca_open_centered_position_with_liquidity",
      response: JSON.stringify({
        whirlpoolAddress: "Gg2oC3dxtZP6HZSQ7ZqWjBkeV2g1rFDMKVeKdv7LjKt8",
        priceOffsetBps: 500,
        inputTokenMint: "So11111111111111111111111111111111111111112",
        inputAmount: 50,
      }),
    },
  },
];

runEvals(
  ORCA_CENTERED_POSITION_DATASET,
  "solana_orca_open_centered_position_with_liquidity eval",
);
