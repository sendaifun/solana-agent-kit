import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  MemorySaver,
  StateGraph,
  Annotation,
  messagesStateReducer,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
});

export async function createSolanaAgentGraph(solanaKit: SolanaAgentKit) {
  // Create LangChain tools
  const tools = createSolanaTools(solanaKit);

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
  try {
    // Initialize Solana Agent Kit
    const agent = new SolanaAgentKit(
      process.env.SOLANA_PRIVATE_KEY!,
      process.env.RPC_URL,
      process.env.OPENAI_API_KEY!,
    );

    // Create LangChain tools
    const app = await createSolanaAgentGraph(agent);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> =>
      new Promise((resolve) => rl.question(prompt, resolve));

    console.log(`
    Available commands:
    - balance: Check your SOL balance
    - send: Send SOL to an address
    - history: View transaction history
    - exit: Quit the program
    `);

    while (true) {
      const userInput = await question("\nEnter a command: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      let interaction: string;

      switch (userInput.toLowerCase()) {
        case "balance":
          interaction = "What's my SOL balance?";
          break;
        case "send": {
          const amount = await question("Enter amount to send: ");
          const address = await question("Enter recipient address: ");
          interaction = `Send ${amount} SOL to address ${address}`;
          break;
        }
        case "history":
          interaction = "Get my transaction history";
          break;
        default:
          console.log("Unknown command. Please try again.");
          continue;
      }

      const initialState = await app.invoke(
        {
          messages: [new HumanMessage(interaction)],
        },
        { configurable: { thread_id: "solana-session-1" } },
      );

      console.log(
        initialState.messages[initialState.messages.length - 1].content,
      );
    }

    rl.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
