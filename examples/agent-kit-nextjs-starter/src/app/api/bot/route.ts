import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { Console } from "console";
import { NextResponse } from "next/server";
import { createSolanaTools, SolanaAgentKit } from "solana-agent-kit";

export async function POST(req: Request) {

    async function initializeAgent() {
      try {
        const llm = new ChatOpenAI({
          modelName: "gpt-3.5-turbo",
          temperature: 0.7,
        });

        const RPC_URL = process.env.RPC_URL!|| "https://api.mainnet-beta.solana.com";
    
        const solanaAgent = new SolanaAgentKit(
          process.env.SOLANA_PRIVATE_KEY!,
          RPC_URL, {
            OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
          }
        );
    
        const tools = createSolanaTools(solanaAgent);
        const memory = new MemorySaver();
        const config = { configurable: { thread_id: "Solana Agent Kit!" } };
    
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

  try {
    // Parse the incoming request body
    const { userInput } = await req.json();

    console.log(userInput);

    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json({ error: "Invalid input provided" }, { status: 400 });
    }

    if (userInput.toLowerCase() === "exit") {
      return NextResponse.json({ message: "Exited chat mode." }, {status: 200});
    }

    const  { agent, config } = await initializeAgent(); 

    const stream = await agent.stream(
      { messages: [new HumanMessage(userInput)] },
      config
    );

    let responseText = "";

    for await (const chunk of stream) {
        if ("agent" in chunk) {
            responseText += chunk.agent.messages[0].content;
        } else if ("tools" in chunk) {
            responseText += chunk.tools.messages[0].content;
        }
    }

    // console.log(responseText);

    return NextResponse.json({ success: true, messages: responseText }, { status: 200});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}