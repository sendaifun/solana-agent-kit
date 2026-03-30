import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageAddCollateral } from "../tools";

export const lavarageAddCollateralAction: Action = {
  name: "LAVARAGE_ADD_COLLATERAL",
  similes: ["add collateral", "reduce liquidation risk", "make position safer", "add margin"],
  description: `Add more of the base token to a position to reduce LTV and move the liquidation price further away.

You must hold the base token in your wallet. For a WBTC/USDC position, you add WBTC.`,
  examples: [[{
    input: { positionAddress: "6vMm...", collateralAmount: "5000" },
    output: { status: "success", signature: "3aPH..." },
    explanation: "Add 5000 satoshis of WBTC to reduce liquidation risk.",
  }]],
  schema: z.object({
    positionAddress: z.string().describe("Position address (base58)"),
    collateralAmount: z.string().describe("Amount of base token in smallest units"),
  }),
  handler: async (agent, input) => {
    try {
      const sig = await lavarageAddCollateral(agent, input.positionAddress, input.collateralAmount);
      return { status: "success", signature: sig };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};
