import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn USDC balance for another wallet",
    inputs: {
      query: "I want to check my friend's balance",
    },
    turns: [
      { input: "Check my friend's USDC balance" },
      {
        input:
          "The wallet address is GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_balance_other",
          params: {
            walletAddress: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
      {
        input: "Also, check my SOL balance",
        expectedToolCall: { tool: "solana_balance", params: {} },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn Balance Other test");
