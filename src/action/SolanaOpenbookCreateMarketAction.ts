import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaOpenbookCreateMarketAction: Action = {
  name: "solana_openbook_create_market",
  similes: ["create_market", "openbook_create_market"],
  description: `Create an Openbook market (required for AMM V4).

  Inputs:
  baseMint: string (required)
  quoteMint: string (required)
  lotSize: number (required)
  tickSize: number (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                baseMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                quoteMint: "So11111111111111111111111111111111111111112",
                lotSize: 100,
                tickSize: 1
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { marketAddress: "market_pubkey_here" }
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const tx = await agent.openbookCreateMarket(
      new PublicKey(input.baseMint),
      new PublicKey(input.quoteMint),
      input.lotSize,
      input.tickSize
    );

    return {
      success: true,
      data: {
        transaction: tx,
        message: "Created Openbook market successfully"
      }
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        baseMint: z.string(),
        quoteMint: z.string(),
        lotSize: z.number().positive(),
        tickSize: z.number().positive()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
