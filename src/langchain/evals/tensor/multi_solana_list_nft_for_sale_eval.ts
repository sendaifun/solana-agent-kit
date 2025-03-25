import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn NFT listing for sale on Tensor",
    inputs: {
      query: "I want to list an NFT for sale",
    },
    turns: [
      { input: "I want to list my NFT for sale" },
      { input: "My NFT mint is DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm" },
      {
        input: "Please list it for 2.5 SOL",
        expectedToolCall: {
          tool: "solana_list_nft_for_sale",
          params: {
            nftMint: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
            price: 2.5,
          },
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn solana_list_nft_for_sale test");
