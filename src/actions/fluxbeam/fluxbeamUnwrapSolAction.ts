import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { fluxbeamUnwrapSOL } from "../../tools";
import { Action } from "../../types";

// Unwrap SOL Action
const fluxbeamUnwrapSolAction: Action = {
  name: "FLUXBEAM_UNWRAP_SOL_ACTION",
  similes: ["unwrap SOL", "convert wSOL to SOL", "get native SOL"],
  description: "Unwraps wSOL back to native SOL",
  examples: [
    [
      {
        input: {
          amount: 1,
        },
        output: {
          status: "success",
          signature: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        explanation: "Unwrap all wSOL to native SOL",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const signature = await fluxbeamUnwrapSOL(agent, input.amount);
    return {
      status: "success",
      signature,
    };
  },
};

export default fluxbeamUnwrapSolAction;
