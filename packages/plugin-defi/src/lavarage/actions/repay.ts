import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { lavarageRepay } from "../tools";

export const lavarageRepayAction: Action = {
  name: "LAVARAGE_REPAY",
  similes: [
    "repay borrow",
    "repay loan",
    "close borrow position",
    "pay back loan",
  ],
  description: `Fully repay a borrow position on Lavarage — return borrowed tokens to the lender and reclaim collateral.

Get positionAddress from LAVARAGE_GET_POSITIONS (filter for BORROW positions).`,
  examples: [
    [
      {
        input: { positionAddress: "GGps6Y..." },
        output: { status: "success", signature: "268wtn..." },
        explanation: "Repay a borrow position and reclaim collateral.",
      },
    ],
  ],
  schema: z.object({
    positionAddress: z.string().describe("Borrow position address (base58)"),
  }),
  handler: async (agent, input) => {
    try {
      const sig = await lavarageRepay(agent, input.positionAddress);
      return { status: "success", signature: sig };
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  },
};
