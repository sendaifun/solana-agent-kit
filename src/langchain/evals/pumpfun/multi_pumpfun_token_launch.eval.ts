import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn PumpFun token launch",
    inputs: {
      query: "I want to launch a new PumpFun token",
    },
    turns: [
      {
        input: "I want to launch a new PumpFun token",
        expectedResponse:
          "Sure, I will need a token name, ticker, image and description.",
      },
      {
        input: "I want it to be called YOLO",
        expectedResponse:
          "Okay, YOLO is the name. What about the ticker, description and image?",
      },
      {
        input: "The ticker should be YOLO and description 'yolo token'",
        expectedResponse: "Great. Do you have an image URL?",
      },
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
