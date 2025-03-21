import { runEvals } from "../utils/runEvals";

const PUMPFUN_TOKEN_LAUNCH_DATASET = [
  {
    inputs: {
      query:
        "Please launch a Pumpfun token for me named YOLO with ticker YOLO, desc 'yolo token', and image https://example.com/yolo.png",
    },
    referenceOutputs: {
      tool: "solana_launch_pumpfun_token",
      response: JSON.stringify({
        tokenName: "YOLO",
        tokenTicker: "YOLO",
        description: "yolo token",
        imageUrl: "https://example.com/yolo.png",
      }),
    },
  },
];

runEvals(PUMPFUN_TOKEN_LAUNCH_DATASET, "PumpFun token launch tests");
