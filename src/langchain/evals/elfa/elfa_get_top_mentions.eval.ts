import { runEvals } from "../utils/runEvals";

const ELFA_GET_TOP_MENTIONS_DATASET = [
  {
    inputs: {
      query: "Get top mentions for ticker BONK in the past hour using Elfa AI ",
    },
    referenceOutputs: {
      tool: "elfa_get_top_mentions",
      response: JSON.stringify({
        ticker: "BONK",
        timeWindow: "1h",
      }),
    },
  },
  {
    inputs: {
      query: "Get top mentions for ticker BTC last 24h using Elfa AI",
    },
    referenceOutputs: {
      tool: "elfa_get_top_mentions",
      response: JSON.stringify({
        ticker: "BTC",
        timeWindow: "24h",
        includeAccountDetails: true,
      }),
    },
  },
];

runEvals(ELFA_GET_TOP_MENTIONS_DATASET, "elfa_get_top_mentions eval");
