import { runEvals } from "../utils/runEvals";

const TOKEN_DETAILED_REPORT_DATASET = [
  {
    inputs: {
      query:
        "Give me a detailed rugcheck report for mint JUPyiwrYJFskUPiHa7hkeR8",
    },
    referenceOutputs: {
      tool: "solana_fetch_token_detailed_report",
      response: "JUPyiwrYJFskUPiHa7hkeR8",
    },
  },
];

runEvals(
  TOKEN_DETAILED_REPORT_DATASET,
  "solana_fetch_token_detailed_report eval",
);
