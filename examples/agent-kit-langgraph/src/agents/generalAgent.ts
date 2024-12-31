import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { gpt4o } from "../utils/model";
import { solanaAgentState } from "../utils/state";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// Initialize tools array
const searchTools = [];

// Only add Tavily search if API key is available
if (process.env.TAVILY_API_KEY) {
  searchTools.push(new TavilySearchResults());
}

const generalAgent = createReactAgent({
  llm: gpt4o,
  tools: searchTools,
});

export const generalistNode = async (state: typeof solanaAgentState.State) => {
  const { messages } = state;

  const result = await generalAgent.invoke({ messages });

  return { messages: [...result.messages] };
};
