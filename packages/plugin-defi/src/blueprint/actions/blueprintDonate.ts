import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { blueprintDonate } from "../tools";

export const blueprintDonateAction: Action = {
  name: "DONATE_TO_BLUEPRINT",
  similes: [
    "donate to Blueprint",
    "support Blueprint staking",
    "tip Blueprint validator",
  ],
  description:
    "Donate SOL to Blueprint to support development of the agentic staking platform. Blueprint is free for all agents — donations help maintain the infrastructure.",
  examples: [
    [
      {
        input: {
          amountSol: 0.1,
        },
        output: {
          status: "success",
          message: "Successfully donated 0.1 SOL to Blueprint",
          signature: "5abc...def",
        },
        explanation: "Donate 0.1 SOL to support Blueprint development",
      },
    ],
  ],
  schema: z.object({
    amountSol: z
      .number()
      .positive()
      .describe("Amount of SOL to donate to Blueprint"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await blueprintDonate(agent, input.amountSol);

      return {
        status: "success",
        message: `Successfully donated ${input.amountSol} SOL to Blueprint`,
        signature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Blueprint donation failed: ${error.message}`,
      };
    }
  },
};
