import { runEvals } from "../utils/runEvals";

const CLOSE_EMPTY_ACCOUNTS_TOOL_CALL_DATASET = [
  {
    inputs: {
      query: "Close all my empty token accounts",
    },
    referenceOutputs: {
      tool: "close_empty_token_accounts",
      response: "{}",
    },
  },
];

runEvals(CLOSE_EMPTY_ACCOUNTS_TOOL_CALL_DATASET, "Close empty accounts");
