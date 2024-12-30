import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";
import { PythFetchPriceResponse } from "../types";

export const SolanaPythFetchPriceAction: Action = {
  name: "solana_pyth_fetch_price",
  similes: ["fetch_price", "pyth_fetch_price"],
  description: `Fetch the price of a given price feed from Pyth's Hermes service.

  Inputs:
  priceFeedID: string, the price feed ID (required), e.g., "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43" for BTC/USD`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                priceFeedID: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { price: 45000.50 }
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const price = await agent.pythFetchPrice(input.priceFeedID);
    const response: PythFetchPriceResponse = {
      status: "success",
      priceFeedID: input.priceFeedID,
      price: price
    };
    return {
      success: true,
      data: response,
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        priceFeedID: z.string()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
