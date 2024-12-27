import { ChatOpenAI } from "@langchain/openai";
import { ChatResponse } from "./types";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export class SolanaAgentService {
  private llm?: ChatOpenAI;
  private threadId: string;

  constructor(id: string) {
    this.threadId = id;
  }

  async processMessage(
    message: string,
    token?: string,
    solPrivateKey?: string,
    solRpcUrl?: string,
  ): Promise<ChatResponse> {
    if (token) {
      this.llm = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0.7,
        apiKey: token,
      });
    }

    const solanaAgent = new SolanaAgentKit(
      solPrivateKey || process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY!,
      solRpcUrl || process.env.NEXT_PUBLIC_RPC_URL,
      process.env.OPENAI_API_KEY!,
    );
    try {
      const tools = createSolanaTools(solanaAgent);

      const systemPrompt = `
          You are a helpful agent that can assist with Solana blockchain interactions.

          Only accept command which is related to tools availabe in the Solana Agent Kit.
          If the user asks about anything else, politely decline and ask if there's anything else you can help with.

          When responding:
          1. Be concise and clear
          2. If asked about Solana operations, explain them simply
          3. If technical details are needed, provide them in a structured way
          4. make sure the response in HTML supported style with minimal tailwind css
          5. make the response visually appealing and easy to read
        `;

      const agent = createReactAgent({
        // @ts-expect-error
        llm: this.llm,
        tools: tools,
        messageModifier: systemPrompt,
      });
      const response = await agent.invoke({ messages: [message] });
      return {
        message: response.messages[response.messages.length - 1].content,
        solanaAction: {
          type: "chat",
          data: {
            text: response.messages[response.messages.length - 1].content,
          },
        },
      };
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }
}
