import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealClosePosition } from "../tools";

export const byrealClosePositionAction: Action = {
  name: "BYREAL_CLOSE_POSITION",
  similes: [
    "close byreal position",
    "withdraw byreal liquidity",
    "remove byreal position",
  ],
  description:
    "Close a CLMM position on Byreal DEX (withdraws all liquidity and fees)",
  examples: [
    [
      {
        input: { nftMint: "NftMintAddr..." },
        output: {
          status: "success",
          message: "Position closed successfully on Byreal",
        },
        explanation: "Close a Byreal CLMM position by its NFT mint",
      },
    ],
  ],
  schema: z.object({
    nftMint: z.string().describe("NFT mint address of the position"),
    slippageBps: z
      .number()
      .optional()
      .describe("Slippage tolerance in basis points"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await byrealClosePosition(
        agent,
        input.nftMint,
        input.slippageBps,
      );
      return {
        status: "success",
        message:
          typeof result === "string"
            ? "Position closed successfully on Byreal"
            : "Close position transaction signed. Please send to network.",
        transaction: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to close Byreal position: ${error.message}`,
      };
    }
  },
};
