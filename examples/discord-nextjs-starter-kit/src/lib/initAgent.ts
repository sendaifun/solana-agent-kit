import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

async function initializeAgent() {
    try {
      const llm = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0.7,
      });
  
      const solanaAgent = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL!,
        {
            OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
        }
      );
  
      const tools = createSolanaTools(solanaAgent);
      const memory = new MemorySaver();
      const config = { 
            configurable: {
                thread_id: "Solana Agent Kit!"
            }
        };
      const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
          You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the
          faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
          (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
          can't do with your currently available tools, you must say so, and encourage them to implement it
          themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
          concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        `,
      });
      return { agent, config };
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      throw error;
    }
  }

export default initializeAgent;