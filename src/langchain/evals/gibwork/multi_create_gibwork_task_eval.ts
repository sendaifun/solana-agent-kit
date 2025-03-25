import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn create Gibwork task",
    inputs: {
      query: "I need to create a new Gibwork task",
    },
    turns: [
      { input: "I need to create a new Gibwork task" },
      { input: "The task is titled 'Fix my website'" },
      {
        input: "Also, what's the current price of JUP?",
        expectedToolCall: {
          tool: "solana_token_data",
          params: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        },
      },
      { input: "It should be for 1000 JUP tokens with no extra content" },
      {
        input: "Set content and requirements to N/A and tag it as webdev",
        expectedToolCall: {
          tool: "create_gibwork_task",
          params: {
            title: "Fix my website",
            content: "N/A",
            requirements: "N/A",
            tags: ["webdev"],
            tokenMintAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            amount: 10,
          },
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn Create Gibwork Task test");
