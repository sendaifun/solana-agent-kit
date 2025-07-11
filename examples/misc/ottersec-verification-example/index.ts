import {
  createLangchainTools,
  KeypairWallet,
  SolanaAgentKit,
} from "./../../../packages/core";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
import miscPlugin from "./../../../packages//plugin-misc";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const main = async () => {
  const keyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
  );

  console.log("keyPair", keyPair);

  const wallet = new KeypairWallet(keyPair, process.env.RPC_URL!);

  console.log("wallet", wallet);

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

  // const prompt = `You are an agent that can call the following tools [create_verification_pda]. The following parameters are required information for create verification pda.

  //   parameter:
  //     programId="6bdJpVRqvStcE7DJjdpRRHGUSKXE82ym9KMYbeKxC6td",
  //     version="0.0.1",
  //     gitUrl="https://github.com/0xobedient/solana-verify-solana-agent-kit-example",
  //     commit="377f933bfc69a0e60aa44196068290c5cdc11d7d",
  //     args=["--library-name", "solana_agent_kit_example"],
  //     deploySlot=352325389

  //   Based on given information please create verification using [create_verification_pda].
  //   `;

  const prompt = `You are an agent that can call the following tools [verify_program]. The following parameters are required information for verify program

    program_id="6bdJpVRqvStcE7DJjdpRRHGUSKXE82ym9KMYbeKxC6td;
    repository="https://github.com/0xobedient/solana-verify-solana-agent-kit-example;
    commit_hash="377f933bfc69a0e60aa44196068290c5cdc11d7d;
  `;

  // const prompt =
  //   "You are an agent that can call the following tools [get_verification_job_status]. The following parameter is required to call tools [get_verification_job_status] which is job_id '18314584-6fe4-47ac-acbd-a71e1446a64f";

  const response = await agent.invoke(
    { messages: [new HumanMessage(prompt)] },
    config
  );

  console.log(response);
};

main();
