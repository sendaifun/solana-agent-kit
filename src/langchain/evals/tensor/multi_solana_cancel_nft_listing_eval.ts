import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn cancellation of NFT listing on Tensor",
    inputs: {
      query: "I need to cancel my NFT listing",
    },
    turns: [
      { input: "I need to cancel my NFT listing" },
      {
        input: "Cancel the listing for my NFT with mint 4KG7k12",
        expectedToolCall: {
          tool: "solana_cancel_nft_listing",
          params: { nftMint: "4KG7k12" },
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn solana_cancel_nft_listing test");
