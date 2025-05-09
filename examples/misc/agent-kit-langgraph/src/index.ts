import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import {
  createLangchainTools,
  KeypairWallet,
  SolanaAgentKit,
} from "solana-agent-kit";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY as string);
const keypair = Keypair.fromSecretKey(secretKey);
const keypairWallet = new KeypairWallet(keypair, process.env.RPC_URL as string);

const agent = new SolanaAgentKit(keypairWallet, keypairWallet.rpcUrl, {});

const langgraphTools = createLangchainTools(agent, agent.actions);
const memory = new MemorySaver();
const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

llm.bindTools(langgraphTools);
const langchainAgent = createReactAgent({
  llm,
  checkpointSaver: memory,
  tools: langgraphTools,
  messageModifier: `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
    empowered to interact onchain using your tools. If you need funds you can request it from the user and provide your wallet details. If there is a 5XX
    (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
    can't do with your currently available tools, you must say so, and encourage them to implement it
    themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
    concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
});

// Now it's time to use!
const agentFinalState = await langchainAgent.invoke(
  { messages: [new HumanMessage("What is my current token balance")] },
  { configurable: { thread_id: "1" } },
);

console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

const agentNextState = await langchainAgent.invoke(
  { messages: [new HumanMessage("What's the price of SOL")] },
  { configurable: { thread_id: "1" } },
);

console.log(
  agentNextState.messages[agentNextState.messages.length - 1].content,
);
