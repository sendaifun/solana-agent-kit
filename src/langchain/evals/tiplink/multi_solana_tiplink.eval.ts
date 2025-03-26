import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn tiplink creation for SOL",
    inputs: {
      query: "I want to create a tiplink",
    },
    turns: [
      { input: "I want to create a tiplink" },
      {
        input: "Tip 0.5 SOL",
        expectedToolCall: { tool: "solana_tiplink", params: { amount: 0.5 } },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn solana_tiplink test");
