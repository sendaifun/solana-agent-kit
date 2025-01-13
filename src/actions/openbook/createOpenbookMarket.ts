import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { openbookCreateMarket } from "../../tools/openbook";

const createOpenbookMarketAction: Action = {
  name: "CREATE_OPENBOOK_MARKET",
  similes: [
    "create openbook market",
    "setup trading market",
    "new openbook market",
    "create trading pair",
    "setup dex market",
    "new trading market",
  ],
  description: "Create a new trading market on Openbook DEX",
  examples: [
    [
      {
        input: {
          baseMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
          quoteMint: "So11111111111111111111111111111111111111112", // SOL
          lotSize: 1,
          tickSize: 0.01,
        },
        output: {
          status: "success",
          signatures: ["2ZE7Rz...", "3YKpM1..."],
          message: "Successfully created Openbook market",
        },
        explanation:
          "Create a new USDC/SOL market on Openbook with default lot and tick sizes",
      },
    ],
  ],
  schema: z.object({
    baseMint: z.string().min(1).describe("The base token's mint address"),
    quoteMint: z.string().min(1).describe("The quote token's mint address"),
    lotSize: z
      .number()
      .positive()
      .default(1)
      .describe("The minimum order size (lot size)"),
    tickSize: z
      .number()
      .positive()
      .default(0.01)
      .describe("The minimum price increment (tick size)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const baseMint = new PublicKey(input.baseMint);
      const quoteMint = new PublicKey(input.quoteMint);
      const lotSize = input.lotSize || 1;
      const tickSize = input.tickSize || 0.01;

      const signatures = await openbookCreateMarket(
        agent,
        baseMint,
        quoteMint,
        lotSize,
        tickSize,
      );

      return {
        status: "success",
        signatures,
        message: "Successfully created Openbook market",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create Openbook market: ${error.message}`,
      };
    }
  },
};

export default createOpenbookMarketAction;
