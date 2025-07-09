import {
  createLangchainTools,
  KeypairWallet,
  SolanaAgentKit,
} from "./../../../packages/core";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
import miscPlugin from "./../../../packages/plugin-misc";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const main = async () => {
  const keyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
  );

  const wallet = new KeypairWallet(keyPair, process.env.RPC_URL!);

  const solanaAgent = new SolanaAgentKit(wallet, process.env.RPC_URL!, {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  }).use(miscPlugin);

  const tools: any[] = createLangchainTools(solanaAgent, solanaAgent.actions);
  const memory = new MemorySaver();
  const config = { configurable: { thread_id: "Solana Agent Kit!" } };

  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.3,
  });

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
        You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you need funds you can request it from the user and provide your wallet details. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      `,
  });

  const prompt =
    "You are an agent that can call the following tools [fetch_token_by_creator]. The following parameter is an account on the Solana blockchain. Please retrieve the SPL Mint tokens that were created by this address. address: 'creator-address''";

  const response = await agent.invoke(
    { messages: [new HumanMessage(prompt)] },
    config
  );

  console.log(response);
};

main();
