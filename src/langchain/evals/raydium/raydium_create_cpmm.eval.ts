import { runEvals } from "../utils/runEvals";

const RAYDIUM_CREATE_CPMM_DATASET = [
  {
    inputs: {
      query:
        "Create a Raydium CPMM with mints baseMint=So11111111111111111111111111111111111111112, quoteMint=JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN, configId=ABC, mintAAmount=5000, mintBAmount=8000, start time 0",
    },
    referenceOutputs: {
      tool: "raydium_create_cpmm",
      response: JSON.stringify({
        mint1: "So11111111111111111111111111111111111111112",
        mint2: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        configId: "4Gn75",
        mintAAmount: 5000,
        mintBAmount: 8000,
        startTime: 0,
      }),
    },
  },
];

runEvals(RAYDIUM_CREATE_CPMM_DATASET, "raydium_create_cpmm eval");
