import { SolanaAgentKit } from "../src";
import { createSolAgent } from "../src/agent/ai";
import * as dotenv from "dotenv";
import test from "node:test";
import { createOpenAI } from "@ai-sdk/openai";
import { createSolanaTools } from "../src/agent/ai/tools";

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
////////////////////////////////////////////////////////////////////////
const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: "strict",
});
const llm = openai("gpt-4o-mini");

const validate_llm = openai("gpt-4o-mini");
////////////////////////////////////////////////////////////////////////

async function initializeAgent() {
  const kit = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL,
    process.env.OPENAI_API_KEY!,
  );
  const tools = createSolanaTools(kit);
  const agent = createSolAgent({
    llm: llm,
    prompt: `
        You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      `,
    maxSteps: 10,
  });
  const validator = createSolAgent({
    llm: validate_llm,
    prompt: ``,
    maxSteps: 10,
  });
  return { agent, validator };
}

test("validate tool check for balance", async () => {
  const res = await createSolAgent({
    llm: llm,
    system:
      "You are a helpful agent that can interact onchain using the Solana Agent Kit. " +
      "You are empowered to interact onchain using your tools ",
    prompt: "what is the wallet address?",
    maxSteps: 10,
  });
  console.log(
    `Initial Balance of the solana for the your wallet is ${res.text}`,
  );
});

test("validate the transfer amount", async () => {
  const res = await createSolAgent({
    llm: llm,
    system:
      "You are a helpful agent that can interact onchain using the Solana Agent Kit. " +
      "You are empowered to interact onchain using your tools ",
    prompt: "transfer 10 SOL to my wallet",
    maxSteps: 10,
  });
  console.log(res.text);
});

test("validate the fetch price of BTC", async () => {
  const res = await createSolAgent({
    llm: llm,
    system:
      "You are a helpful agent that can interact onchain using the Solana Agent Kit. " +
      "You are empowered to interact onchain using your tools ",
    prompt: "fetch price of BTC",
    maxSteps: 10,
  });
  console.log(res.text);
});

test("get My wallet address", async () => {
  const res = await createSolAgent({
    llm: llm,
    system:
      "You are a helpful agent that can interact onchain using the Solana Agent Kit. " +
      "You are empowered to interact onchain using your tools ",
    prompt: "what is the wallet address?",
    maxSteps: 10,
  });
  console.log(res.text);
});
