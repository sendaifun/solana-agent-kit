import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn cancellation of NFT listing on Tensor",
    inputs: {
      query: "I need to cancel my NFT listing",
    },
    turns: [
      {
        input: "I need to cancel my NFT listing",
        expectedResponse: "Please provide the mint address of your NFT.",
      },
      {
        input: "zZNEUiAq2kLgWFJiZofHfcar91ph7yE2nUfLmXswkvP",
        expectedToolCall: {
          tool: "solana_cancel_nft_listing",
          params: { nftMint: "zZNEUiAq2kLgWFJiZofHfcar91ph7yE2nUfLmXswkvP" },
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn solana_cancel_nft_listing test");
