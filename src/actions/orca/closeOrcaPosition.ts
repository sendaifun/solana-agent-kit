import { z } from "zod";
import type { Action } from "../../types";
import { orcaClosePosition } from "../../tools";
import { PublicKey } from "@solana/web3.js";

const closeOrcaPositionAction: Action = {
  name: "CLOSE_ORCA_POSITION_ACTION",
  similes: [
    "close orca liquidity position",
    "close orca whirlpool position",
    "close orca liquidity pool",
    "close my orca liquidity position",
  ],
  description:
    "Close an existing liquidity position in an Orca Whirlpool. This functions fetches the position details using the provided mint address and closes the position with a 1% slippage",
  examples: [
    [
      {
        input: {
          positionMintAddress: "EPjasdf...",
        },
        output: {
          status: "success",
          signature: "12Erx...",
          message: "Successfully closed Orca whirlpool position",
        },
        explanation: "Close a USDC/SOL whirlpool position",
      },
    ],
  ],
  schema: z.object({
    positionMintAddress: z
      .string()
      .describe("The mint address of the liquidity position to close"),
  }),
  handler: async (agent, input) => {
    try {
      const signature = await orcaClosePosition(
        agent,
        new PublicKey(input.positionMintAddress),
      );

      return {
        status: "success",
        signature,
        message: "Successfully closed Orca whirlpool position",
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - TS doesn't know that `e` has a `message` property
        message: `Failed to close Orca whirlpool position: ${e.message}`,
      };
    }
  },
};

export default closeOrcaPositionAction;
