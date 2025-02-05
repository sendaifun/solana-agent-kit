import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { fluxbeamWrapSOL } from "../../tools";
import { Action } from "../../types";

// Wrap SOL Action
const fluxbeamWrapSolAction: Action = {
  name: "FLUXBEAM_WRAP_SOL_ACTION",
  similes: ["wrap SOL", "convert SOL to wSOL", "get wrapped SOL"],
  description: "Wrap native SOL into wrapped SOL (wSOL)",
  examples: [
    [
      {
        input: {
          amount: 1,
        },
        output: {
          status: "success",
          signature: "cZy5...",
        },
        explanation: "Wrap 1 SOL into wSOL",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive().describe("amount of sol to wrap"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const signature = await fluxbeamWrapSOL(agent, input.amount);
    return {
      status: "success",
      signature: signature,
    };
  },
};

export default fluxbeamWrapSolAction;
