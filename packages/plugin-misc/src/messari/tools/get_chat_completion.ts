import { SolanaAgentKit } from "solana-agent-kit";
import { MessariAPIResponse } from "../types";

export async function getChatCompletion(
  agent: SolanaAgentKit, question: string
): Promise<any> {
  try {
    const apiKey = agent.config?.MESSARI_API_KEY;
    if (!apiKey) {
      throw new Error("No Messari API Key provided");
    }

    const url = `https://api.messari.io/ai/v1/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-messari-api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });
    
    const data = (await response.json()) as MessariAPIResponse;
    const result = data.data.messages[0].content;
    return result;

  } catch (error: any) {
    console.error("Error retrieving assets: ", error.errorResponse.error);
    throw new Error(`Error fetching data from Messari: ${error.errorResponse.error}`);
  }
}
