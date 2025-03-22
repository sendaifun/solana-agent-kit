// src/actions/okx-dex/quote_action.ts
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getLiquidity, getQuote } from "../../tools/okx-dex";

const okxDexLiquidityAction: Action = {
  name: "OKX_DEX_LIQUIDITY",
  similes: ["get liquidity", "okx dex liquidity"],
  description: "Get liquidity sources supported by OKX DEX.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          summary: {
            liquidity: [
              {
                symbol: "SOL",
                name: "Solana",
                address: "So11111111111111111111111111111111111111112",
              },
            ],
          },
        },
        explanation: "Getting liquidity sources supported by OKX DEX",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const liquidity = await getLiquidity(agent, "solana");
    return {
      status: "success",
      summary: {
        liquidity: liquidity,
      },
    };
  },
};

export default okxDexLiquidityAction;
