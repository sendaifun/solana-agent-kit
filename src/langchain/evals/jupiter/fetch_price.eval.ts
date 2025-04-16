import { runEvals } from "../utils/runEvals";

const PRICE_FETCH_TOOL_CALL_DATASET = [
  {
    inputs: {
      query:
        "How much is the token with the mint address JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN worth right now?",
    },
    referenceOutputs: {
      tool: "solana_fetch_price",
      response: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    },
  },
];

runEvals(PRICE_FETCH_TOOL_CALL_DATASET, "Price fetching tests");
