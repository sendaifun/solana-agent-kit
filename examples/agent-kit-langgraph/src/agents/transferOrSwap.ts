import { gpt4o } from "../utils/model";
import { agentKit } from "../utils/solanaAgent";
import { solanaAgentState } from "../utils/state";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SolanaTransferTool } from "solana-agent-kit/dist/langchain";
import { transferSwapPrompt } from "../prompts/transferSwap";
import { swapTool } from "../tools/swap";

const transferOrSwapAgent = createReactAgent({
  stateModifier: transferSwapPrompt,
  llm: gpt4o,
  tools: [new SolanaTransferTool(agentKit), swapTool],
});

export const transferSwapNode = async (
  state: typeof solanaAgentState.State,
) => {
  const { messages } = state;

  const result = await transferOrSwapAgent.invoke({
    messages,
  });

  return result;
};
