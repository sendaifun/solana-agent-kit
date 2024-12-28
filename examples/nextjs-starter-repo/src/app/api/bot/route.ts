import { NextRequest, NextResponse } from 'next/server';
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const WALLET_DATA_FILE = "wallet_data.txt";

function validateEnvironment(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "RPC_URL", "SOLANA_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    throw new Error("Missing required environment variables.");
  }
}

async function initializeAgent() {
  try {
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    let walletDataStr: string | null = null;

    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
      }
    }

    const solanaAgent = new SolanaAgentKit(
      process.env.SOLANA_PRIVATE_KEY!,
      process.env.RPC_URL!,
      process.env.OPENAI_API_KEY!,
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

    if (walletDataStr) {
      fs.writeFileSync(WALLET_DATA_FILE, walletDataStr);
    }

    return { agent, config };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    validateEnvironment();

    const { message } = await req.json();
    const { agent, config } = await initializeAgent();

    const stream = await agent.stream(
      { messages: [new HumanMessage(message)] },
      config
    );

    let responseContent = "";

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        responseContent += chunk.agent.messages[0].content;
      } else if ("tools" in chunk) {
        responseContent += chunk.tools.messages[0].content;
      }
    }

    return NextResponse.json({ reply: responseContent }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process the request." },
      { status: 500 }
    );
  }
}
