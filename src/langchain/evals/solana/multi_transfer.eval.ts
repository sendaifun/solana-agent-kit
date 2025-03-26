import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn SOL transfer",
    inputs: {
      query: "I want to send some SOL"
    },
    turns: [
      { input: "I want to send some SOL" },
      { input: "Please transfer 0.05 SOL" },
      { input: "Send it to wallet GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB", expectedToolCall: { tool: "solana_transfer", params: { to: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB", amount: 0.05 } } }
    ]
  }
];

runComplexEval(DATASET, "Multi-turn Transfer test");