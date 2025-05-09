import 'dotenv/config';
import { Client, GatewayIntentBits, Events, ChannelType, Partials } from 'discord.js';
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { KeypairWallet, SolanaAgentKit, createLangchainTools } from 'solana-agent-kit';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

const client = new Client({
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
  partials: [Partials.Message, Partials.Channel],
});

const chatHistory = new Map();

async function initializeAgent() {
  try {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.3,
    });

    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY as string);
    const keypair = Keypair.fromSecretKey(secretKey);
    const keypairWallet = new KeypairWallet(keypair, process.env.RPC_URL as string);

    const solanaAgent = new SolanaAgentKit(keypairWallet, process.env.SOLANA_RPC_URL as string, {});

    const tools = createLangchainTools(solanaAgent, solanaAgent.actions);

    const memory = new MemorySaver();
    const config = { configurable: { thread_id: 'Solana Agent Kit!' } };

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

    return { agent, config };
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    throw error;
  }
}

client.on(Events.ClientReady, async () => {
  // gets data about the bot
  await client.application?.fetch();

  console.info(`${client.user?.username || 'Bot'} is running. Send it a message in Discord DM to get started.`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.channel.type !== ChannelType.DM || message.author.bot) {
      return;
    }

    console.info(`Received message: ${message.content}`);
    await message.channel.sendTyping();

    const { agent, config } = await initializeAgent();

    const userId = message.author.id;
    if (!chatHistory.has(userId)) {
      chatHistory.set(userId, []);
    }
    const userChatHistory = chatHistory.get(userId);
    userChatHistory.push(new HumanMessage(message.content));

    const stream = await agent.stream({ messages: userChatHistory }, config);

    const replyIfNotEmpty = async (content: string) => content.trim() !== '' && message.reply(content);

    for await (const chunk of stream) {
      if ('agent' in chunk) {
        const agentMessage = chunk.agent.messages[0].content;
        await replyIfNotEmpty(agentMessage);
        userChatHistory.push(new HumanMessage(agentMessage));
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
