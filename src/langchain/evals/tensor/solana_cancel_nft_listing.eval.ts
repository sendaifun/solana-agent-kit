import { runEvals } from "../utils/runEvals";

const CANCEL_NFT_LISTING_DATASET = [
  {
    inputs: {
      query: "Cancel listing for my NFT with mint 4KG7k12 on Tensor"
    },
    referenceOutputs: {
      tool: "solana_cancel_nft_listing",
      response: JSON.stringify({
        nftMint: "4KG7k12"
      }),
    },
  },
];

runEvals(CANCEL_NFT_LISTING_DATASET, "solana_cancel_nft_listing eval");