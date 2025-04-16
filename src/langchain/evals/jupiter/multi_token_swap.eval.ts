import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn token swap",
    inputs: {
      query: "I want to swap some tokens",
    },
    turns: [
      {
        input: "I want to swap some tokens",
        expectedResponse: "Sure, which tokens would you like to swap?",
      },
      {
        input: "I want to exchange USDC for JUP tokens",
        expectedResponse: "How much USDC?",
      },
      {
        input: "Swap 10 USDC for JUP with 1% slippage",
        expectedToolCall: {
          tool: "solana_trade",
          params: {
            outputMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            inputAmount: 10,
            inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            slippageBps: 100,
          },
        },
      },
      {
        input:
          "Then check the USDC balance of GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_balance_other",
          params: {
            tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn Token Swap test");
