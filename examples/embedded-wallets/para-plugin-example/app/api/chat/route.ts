import { NextRequest } from "next/server";
import { Message, LanguageModelV1, streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createVercelAITools } from "solana-agent-kit";
import { solanaAgentWithPara } from "@/utils/init_server";
import { listParaToolsWeb } from "@/utils/get_all_tools";

const openai = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.OPENAI_API_KEY,
});
export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    // Rename keys on Vercel AI tools object to each tool.id
    const rawVercelTools = createVercelAITools(
      solanaAgentWithPara,
      solanaAgentWithPara.actions,
    );
    const vercelTools = Object.fromEntries(
      Object.values(rawVercelTools).map((t) => [(t as any).id, t]),
    );
    const webTools = listParaToolsWeb();

    const tools = { ...vercelTools, ...webTools };
    const result = await streamText({
      model: openai(
        "meta-llama/llama-4-maverick-17b-128e-instruct",
      ) as LanguageModelV1,
      tools: tools as any,
      system: `
      You are a helpful agent that can interact onchain using the Solana Agent Kit. 
    `,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
