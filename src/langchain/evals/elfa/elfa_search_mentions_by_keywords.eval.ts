import { runEvals } from "../utils/runEvals";

const ELFA_SEARCH_MENTIONS_BY_KEYWORDS_DATASET = [
  {
    inputs: {
      query: "Search mentions for 'ai, agents' from 1738675001 to 1738775001 limit 10"
    },
    referenceOutputs: {
      tool: "elfa_search_mentions_by_keywords",
      response: JSON.stringify({
        keywords: "ai, agents",
        from: 1738675001,
        to: 1738775001,
        limit: 10
      }),
    },
  },
];

runEvals(ELFA_SEARCH_MENTIONS_BY_KEYWORDS_DATASET, "elfa_search_mentions_by_keywords eval");