import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { gpt4o } from "../utils/model";
import { solanaAgentState } from "../utils/state";
import { agentKit } from "../utils/solanaAgent";
import {
  SolanaBalanceTool,
  SolanaFetchPriceTool,
} from "solana-agent-kit/dist/langchain";

const readAgent = createReactAgent({
  llm: gpt4o,
  tools: [new SolanaBalanceTool(agentKit), new SolanaFetchPriceTool(agentKit)],
});

export const readNode = async (state: typeof solanaAgentState.State) => {
  const { messages } = state;

  const result = await readAgent.invoke({ messages });

  return { messages: [...result.messages] };
};
