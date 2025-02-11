import { z } from "zod";
import type { Action } from "../../types";
import { PublicKey } from "@solana/web3.js";
import { orcaOpenCenteredPositionWithLiquidity } from "../../tools";
import Decimal from "decimal.js";

const openOrcaCenteredPositionWithLiquidityAction: Action = {
  name: "OPEN_ORCA_CENTERED_POSITION_WITH_LIQUIDITY_ACTION",
  description:
    "Open a new Orca whirlpool position with liquidity centered around the current price. This function opens a new liquidity position in an Orca whirlpool with the provided liquidity amount centered around the current price.",
  similes: [
    "open orca liquidity position",
    "open orca whirlpool position",
    "open orca liquidity pool",
    "open new orca liquidity position",
    "open centered orca liquidity position",
  ],
  examples: [
    [
      {
        input: {
          whirlpoolAddress: "EPjasdf...",
          priceOffsetBps: 500,
          inputTokenMint: "EPjasdf...",
          inputAmount: 100.0,
        },
        output: {
          status: "success",
          signature: "12Erx...",
          message: "Centered liquidity position opened successfully",
        },
        explanation: "Open a USDC/SOL whirlpool position",
      },
    ],
  ],
  schema: z.object({
    whirlpoolAddress: z
      .string()
      .describe("The address of the Orca whirlpool to open a position in"),
    priceOffsetBps: z
      .number()
      .positive()
      .min(100)
      .describe("The price offset in basis points for the new position"),
    inputTokenMint: z
      .string()
      .describe("The mint address of the token to deposit"),
    inputAmount: z
      .number()
      .positive()
      .describe("The amount of the token to deposit"),
  }),
  handler: async (agent, input) => {
    try {
      const [whirlpoolAddress, inputTokenMint, priceOffsetBps, inputAmount] = [
        new PublicKey(input.whirlpoolAddress),
        new PublicKey(input.inputTokenMint),
        input.priceOffsetBps,
        new Decimal(input.inputAmount),
      ];

      const signature = await orcaOpenCenteredPositionWithLiquidity(
        agent,
        whirlpoolAddress,
        priceOffsetBps,
        inputTokenMint,
        inputAmount,
      );

      return {
        status: "success",
        signature,
        message: "Centered liquidity position opened successfully",
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - TS doesn't know that `e` has a `message` property
        message: `Failed to open centered Orca whirlpool position: ${e.message}`,
      };
    }
  },
};

export default openOrcaCenteredPositionWithLiquidityAction;
