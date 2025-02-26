import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { manifestCreateMarket } from "../tools";

const manifestCreateMarketAction: Action = {
  name: "CREATE_MANIFEST_MARKET",
  similes: [
    "create manifest market",
    "setup manifest market",
    "new manifest market",
    "create trading pair",
    "setup manifest trading",
    "initialize manifest market",
  ],
  description: "Create a new trading market on Manifest protocol",
  examples: [
    [
      {
        input: {
          baseMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
          quoteMint: "So11111111111111111111111111111111111111112", // SOL
        },
        output: {
          status: "success",
          marketId: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          signature: "2ZE7Rz...",
          message: "Successfully created Manifest market",
        },
        explanation: "Create a new USDC/SOL market on Manifest",
      },
    ],
  ],
  schema: z.object({
    baseMint: z.string().min(32, "Invalid base mint address"),
    quoteMint: z.string().min(32, "Invalid quote mint address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const [transaction, marketId] = await manifestCreateMarket(
        agent,
        new PublicKey(input.baseMint),
        new PublicKey(input.quoteMint),
      );

      return {
        status: "success",
        marketId,
        transaction,
        message: "Successfully created Manifest market",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create Manifest market: ${error.message}`,
      };
    }
  },
};

export default manifestCreateMarketAction;
