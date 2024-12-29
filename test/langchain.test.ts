import { SolanaAgentKit } from "../src";
import { createSolanaTools } from "../src/agent/langchain/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import test from "node:test";

dotenv.config();

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

//// switch this llm to local lamma or anyother llm code still should work
const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

const validate_llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

async function initializeAgent() {
  const kit = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL,
    process.env.OPENAI_API_KEY!,
  );
  const tools = createSolanaTools(kit);
  // const memory = new MemorySaver();
  const config = { configurable: { thread_id: "Solana Agent Kit!" } };
  const agent = createReactAgent({
    llm,
    tools,
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
  const validator = createReactAgent({
    llm: validate_llm,
    tools: [],
    messageModifier: `
        You are a validator agent that can validate the Solana Agent Kit. 
        you will been given the question and answer and expected to validate the answer.
      `,
  });
  return { agent, validator };
}

test("validate tool check for balance", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "what is the wallet address?" }],
  });
  console.log(
    `Initial Balance of the solana for the your wallet is ${res.messages[0].content}`,
  );
});

test("validate the transfer amount", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "transfer 10 SOL to my wallet" }],
  });
  console.log(`Transfer amount is ${res.messages[0].content}`);
});

test("validate the minting of NFT", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "mint NFT" }],
  });
  console.log(`Minting NFT is ${res.messages[0].content}`);
});

test("validate the trade of NFT", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "trade NFT" }],
  });
  console.log(`Trade NFT is ${res.messages[0].content}`);
});

test("validate the stake of SOL", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "stake SOL" }],
  });
  console.log(`Stake SOL is ${res.messages[0].content}`);
});

test("validate the fetch price of BTC", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "fetch price of BTC" }],
  });
  console.log(
    `Fetch price of BTC is ${res.messages[res.messages.length - 1].content}`,
  );
});

test("validate the fetch price of ETH", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "fetch price of ETH" }],
  });
  console.log(
    `Fetch price of ETH is ${res.messages[res.messages.length - 1].content}`,
  );
});

test("validate the fetch price of USDC", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "fetch price of USDC" }],
  });
  console.log(
    `Fetch price of USDC is ${res.messages[res.messages.length - 1].content}`,
  );
});

test("validate the fetch price of USDT", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "fetch price of USDT" }],
  });
  console.log(
    `Fetch price of USDT is ${res.messages[res.messages.length - 1].content}`,
  );
});

test("get My wallet address", async () => {
  const { agent, validator } = await initializeAgent();
  const res = await agent.invoke({
    messages: [{ role: "user", content: "what is the wallet address?" }],
  });
  console.log(
    `Initial Balance of the solana for the your wallet is ${res.messages[res.messages.length - 1].content}`,
  );
});
