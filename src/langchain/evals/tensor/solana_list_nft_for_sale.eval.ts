import { runEvals } from "../utils/runEvals";

const LIST_NFT_FOR_SALE_DATASET = [
  {
    inputs: {
      query:
        "List my NFT with mint DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm for sale at 2.5 SOL on Tensor",
    },
    referenceOutputs: {
      tool: "solana_list_nft_for_sale",
      response: JSON.stringify({
        nftMint: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
        price: 2.5,
      }),
    },
  },
  {
    inputs: {
      query:
        "Sell NFT mint address DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm for 0.89 SOL on Tensor",
    },
    referenceOutputs: {
      tool: "solana_list_nft_for_sale",
      response: JSON.stringify({
        nftMint: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
        price: 0.89,
      }),
    },
  },
];

runEvals(LIST_NFT_FOR_SALE_DATASET, "solana_list_nft_for_sale eval");
