import { z } from "zod";
import { Action } from "solana-agent-kit";
import { getChatCompletion } from "../tools";

const getMessariChatCompletion: Action = {
  name: "GET_MESSARI_CHAT_COMPLETION",
  description: `This tool queries Messari AI for comprehensive crypto research across these datasets: 
  Latest crypto news, CEX/DEX volumes, market share, transaction fees, total transactions, Asset prices, 
  trading volume, market cap, TVL, and historical performance, Investment data, Technical analysis of how protocols work, 
  tokenomics, and yield mechanisms, Twitter followers and Reddit subscribers metrics, growth trends`,
  similes: [
    "Using Messari: What is the average TPS and total fee revenue last month for Solana? ",
    "What does Messari say about Solana’s price and volume over the past month?",
    "Can you check Solana’s TPS and fee stats last month using Messari?",
    "Any recent insights from Messari on Avalanche’s activity?",
    "What’s Messari saying about Ethereum staking trends lately?",
    "Can you use Messari to see how Uniswap has been performing recently?",
    "Find out what Messari reports about NFT trading volume this week.",
    "Check with Messari: how’s the Polygon ecosystem been doing?",
    "What does Messari say about stablecoin inflows to BSC recently?",
    "Can you look up the top DeFi protocols this month on Messari?",
    "Any updates from Messari on gas fees for Base or zkSync?",
    "What does Messari show about daily users on Arbitrum and Optimism?",
    "Is there any data from Messari on token unlocks last week?",
    "Check Messari for Bitcoin’s market behavior after the Fed news.",
    "Does Messari say anything about Cardano’s developer activity?",
    "What are the biggest altcoin gainers recently, according to Messari?",
    "Can you use Messari to compare activity between Solana and Ethereum?",
    "What does Messari report about recent DAO treasury changes?",
    "Any interesting trends in Layer 2 growth according to Messari?",
  ],
  examples: [
    [
      {
        input: {
          question: "How did ethereum performed over the last month in terms of its price and trading volume?"
        },
        output: {
          data: {
            messages: [
              {
                role: "assistant",
                content:
                  "Ethereum (ETH) has shown strong performance over the past month with a 15% price increase. The current price is approximately $3,500, up from $3,000 at the beginning of the month. Trading volume has also increased by 20% in the same period.",
              },
            ],
          },
        }
      }
    ],
  ],
  schema: z.object({
    question: z.string().nonempty()
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const question = input.question as string;
      return {
        status: "success",
        result: await getChatCompletion(agent, question),
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is not a property of unknown
        message: e.message,
      };
    }
  },
};

export default getMessariChatCompletion;
