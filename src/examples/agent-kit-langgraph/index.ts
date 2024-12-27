import { SolanaAgentKit } from "../../agent";
import { SolanaBalanceTool } from "../../langchain";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import * as dotenv from "dotenv";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";

dotenv.config();

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
});

export async function createSolanaAgentGraph(solanaKit: SolanaAgentKit) {
  // Create Solana tools
  const tools = [new SolanaBalanceTool(solanaKit)];

  const toolNode = new ToolNode(tools);

  // Initialize the model with Solana-specific system prompt
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY!,
  }).bindTools(tools);

  // Define the model call function
  async function callModel(state: typeof StateAnnotation.State) {
    const messages = state.messages;
    const response = await model.invoke(messages);
    return { messages: [response] };
  }

  // Create the graph
  const workflow = new StateGraph(StateAnnotation)
    .addNode("agent", callModel, { ends: ["tools"] })
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("agent", "tools");

  // Initialize memory
  const checkpointer = new MemorySaver();

  // Compile the graph
  return workflow.compile({ checkpointer });
}

async function main() {
  // Initialize SolanaAgentKit with environment variables
  const solanaKit = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL,
    process.env.OPENAI_API_KEY!,
  );

  // Create LangChain tools
  const app = await createSolanaAgentGraph(solanaKit);

  const initialState = await app.invoke(
    {
      messages: [new HumanMessage("What's my SOL balance?")],
    },
    { configurable: { thread_id: "solana-session-1" } },
  );

  console.log(initialState.messages[initialState.messages.length - 1].content);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
