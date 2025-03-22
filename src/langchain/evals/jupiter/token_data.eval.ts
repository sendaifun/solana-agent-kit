import { runEvals } from "../utils/runEvals";

const TOKEN_DATA_TOOL_CALL_DATASET = [
  {
    inputs: {
      query:
        "Tell me about the token with the mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v.",
    },
    referenceOutputs: {
      tool: "solana_token_data",
      response: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
  },
  {
    inputs: {
      query:
        "What token is at address So11111111111111111111111111111111111111112?",
    },
    referenceOutputs: {
      tool: "solana_token_data",
      response: "So11111111111111111111111111111111111111112",
    },
  },
];

runEvals(TOKEN_DATA_TOOL_CALL_DATASET, "Token data tests");
