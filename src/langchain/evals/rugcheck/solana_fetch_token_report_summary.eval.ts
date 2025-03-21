import { runEvals } from "../utils/runEvals";

const TOKEN_REPORT_SUMMARY_DATASET = [
  {
    inputs: {
      query: "Get rugcheck summary for JUP token with mint JUPyiwrYJFskUPiHa7hkeR8",
    },
    referenceOutputs: {
      tool: "solana_fetch_token_report_summary",
      response: "JUPyiwrYJFskUPiHa7hkeR8",
    },
  },
];

runEvals(TOKEN_REPORT_SUMMARY_DATASET, "solana_fetch_token_report_summary eval");