import 'dotenv/config';
import { Client, GatewayIntentBits, Events, ChannelType, Partials } from 'discord.js';
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

async function initializeAgent() {
  try {
    const llm = new ChatOpenAI({
      modelName: model,
      temperature: 0.3,
    });

    const solanaAgent = new SolanaAgentKit(process.env.SOLANA_PRIVATE_KEY!, process.env.SOLANA_RPC_URL!, {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      // OPENAI_BASE_URL: process.env.OPENAI_BASE_URL!,
    });

    const tools = createSolanaTools(solanaAgent);

    const memory = new MemorySaver();
    const config = { configurable: { thread_id: 'Solana Agent Kit!' } };

    const agent = createReactAgent({
      llm,
      tools: [],
      checkpointSaver: memory,
      messageModifier: `
You are a helpful agent that can interact onchain using the Solana Agent Kit. You are an LLM specialized on onchain actions. Given the sample prompt below, extract the onchain address.
      `,
    });

    return { agent, config };
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    throw error;
  }
}

let score = 0;
async function main() {
  const { agent, config } = await initializeAgent();
  const response = await fetch('https://huggingface.co/datasets/evalengine/defai-eval/raw/main/final_data.csv');
  const csvText = await response.text();
  const rows = csvText.split('\n').map(row => row.split(','));
  const headers = rows[0];
  const data = rows.slice(1)
    .map(row => {
      return headers.reduce((obj, header, index) => {
        obj[header] = row[index];
        return obj;
      }, {} as Record<string, string>);
    })
    // .filter(row => row.chain === 'solana');
  console.log(`Loaded ${data.length} evaluation records`);

  for (const row of data.slice(0, 3)) {
    const result = await agent.invoke({ messages: [{ role: 'user', content: row.prompt }] }, config);
    
  }
  // console.log(result);
}

main();
