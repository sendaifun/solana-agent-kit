import NFTPlugin from "@solana-agent-kit/plugin-nft";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import {
  KeypairWallet,
  SolanaAgentKit,
  createLangchainTools,
} from "solana-agent-kit";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import * as readline from "node:readline";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

dotenv.config();
const checkpointer = PostgresSaver.fromConnString(process.env.POSTGRES_DB_URL!);

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
    process.exit(1);
  }
}
validateEnvironment();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));

async function langchainAITests(agent: SolanaAgentKit): Promise<void> {
  const tools = createLangchainTools(agent, agent.actions);
  await checkpointer.setup();
  const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY as string,
  });
  llm.bindTools(tools);

  const langchainAgent = createReactAgent({
    llm,
    tools,
    checkpointSaver: checkpointer,
    messageModifier: `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
    empowered to interact onchain using your tools. If you need funds you can request it from the user and provide your wallet details. If there is a 5XX
    (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
    can't do with your currently available tools, you must say so, and encourage them to implement it
    themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
    concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
  });

  try {
    while (true) {
      const prompt = await question("\nYou: ");
      if (prompt === "exit") {
        break;
      }

      const stream = await langchainAgent.stream(
        { messages: [new HumanMessage(prompt)] },
        { configurable: { thread_id: "Solana Agent Kit" } }
      );

      process.stdout.write("Agent: ");
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          process.stdout.write(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          process.stdout.write(chunk.tools.messages[0].content);
        }
      }
      console.log();
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error:", e.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function aiTests(agentKit: SolanaAgentKit): Promise<void> {
  await langchainAITests(agentKit);
}

async function main() {
  const keyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.SOLANA_PRIVATE_KEY as string)
  );
  const wallet = new KeypairWallet(keyPair, process.env.RPC_URL as string);

  const agent = new SolanaAgentKit(wallet, process.env.RPC_URL!, {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  })
    .use(TokenPlugin)
    .use(NFTPlugin);

  await aiTests(agent);

  console.log("All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during tests:", error);
    process.exit(1);
  });
