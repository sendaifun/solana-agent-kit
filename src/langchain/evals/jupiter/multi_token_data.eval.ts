import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn token data inquiry",
    inputs: {
      query: "What's the price of KING?",
    },
    turns: [
      { input: "What's the price of KING?" },
      {
        input:
          "The mint address is 5eqNDjbsWL9hfAqUfhegTxgEa3XardzGdVAboMA4pump",
        expectedToolCall: {
          tool: "solana_token_data",
          params: "5eqNDjbsWL9hfAqUfhegTxgEa3XardzGdVAboMA4pump",
        },
      },
      {
        input: "Buy 20 tokens using USDC",
        expectedToolCall: {
          tool: "solana_trade",
          params: {
            inputAmount: 20,
            inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            outputMint: "5eqNDjbsWL9hfAqUfhegTxgEa3XardzGdVAboMA4pump",
            slippageBps: 100,
          },
        },
      },
      {
        input: "And check my KING balance",
        expectedToolCall: {
          tool: "solana_balance_other",
          params: {
            walletAddress: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            tokenAddress: "5eqNDjbsWL9hfAqUfhegTxgEa3XardzGdVAboMA4pump",
          },
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn Token Data test");
