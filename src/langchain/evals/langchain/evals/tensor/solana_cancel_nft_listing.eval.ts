import { runEvals } from "../utils/runEvals";

const CANCEL_NFT_LISTING_DATASET = [
  {
    inputs: {
      query:
        "Cancel listing for my NFT with mint DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm on Tensor",
    },
    referenceOutputs: {
      tool: "solana_cancel_nft_listing",
      response: JSON.stringify({
        nftMint: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
      }),
    },
  },
];

runEvals(CANCEL_NFT_LISTING_DATASET, "solana_cancel_nft_listing eval");
