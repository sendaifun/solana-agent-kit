import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn PumpFun token launch",
    inputs: {
      query: "I want to launch a new PumpFun token",
    },
    turns: [
      { input: "I want to launch a new PumpFun token" },
      { input: "I want it to be called YOLO" },
      { input: "The ticker should be YOLO and description 'yolo token'" },
      {
        input: "Use the image URL https://example.com/yolo.png",
        expectedToolCall: {
          tool: "solana_launch_pumpfun_token",
          params: {
            tokenName: "YOLO",
            tokenTicker: "YOLO",
            description: "yolo token",
            imageUrl: "https://example.com/yolo.png",
          },
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn PumpFun token launch test");
