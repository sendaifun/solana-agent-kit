import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn restake SOL",
    inputs: {
      query: "I want to restake my SOL"
    },
    turns: [
      { input: "I want to restake my SOL" },
      { input: "Please restake 1.5 SOL for me", expectedToolCall: { tool: "solana_restake", params: { amount: 1.5 } } },
      { input: "Then check my updated SOL balance", expectedToolCall: { tool: "solana_balance", params: {} } }
    ]
  }
];

runComplexEval(DATASET, "Multi-turn Restake test");