import { ChatOpenAI } from "@langchain/openai";
import { ChatResponse } from "./types";

export class SolanaAgentService {
  private llm: ChatOpenAI;
  private threadId: string;

  constructor(id: string) {
    this.threadId = id;
    this.llm = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
    });
  }

  async processMessage(message: string, token?: string): Promise<ChatResponse> {
    if (token) {
      this.llm.apiKey = token;
    }
    try {
      const systemPrompt = `
        You are a helpful agent that can assist with Solana blockchain interactions.

        Only accept command which is related to tools availabe in the Solana Agent Kit.
        If the user asks about anything else, politely decline and ask if there's anything else you can help with.
        
        When responding:
        1. Be concise and clear
        2. If asked about Solana operations, explain them simply
        3. If technical details are needed, provide them in a structured way
        4. make sure the response in HTML supported style with minimal tailwind css
      `;

      const response = await this.llm.invoke([
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ]);

      return {
        message: response.content.toString(),
        solanaAction: {
          type: "chat",
          data: { text: response.content },
        },
      };
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }
}
