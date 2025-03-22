import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { executeSwap, getQuote, getTokens } from "../../tools/okx-dex";

const okxDexTokensAction: Action = {
  name: "OKX_DEX_TOKENS",
  similes: ["list tokens", "okx dex tokens"],
  description: "List all tokens supported by OKX DEX.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          summary: {
            tokens: [
              {
                symbol: "SOL",
                name: "Solana",
                address: "So11111111111111111111111111111111111111112",
              },
              {
                symbol: "USDC",
                name: "USD Coin",
                address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              },
            ],
          },
        },
        explanation: "Listing all tokens supported by OKX DEX",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const tokens = await getTokens(agent);
    return {
      status: "success",
      summary: {
        tokens: tokens,
      },
    };
  },
};

export default okxDexTokensAction;
