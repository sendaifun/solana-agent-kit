import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { blueprintUnstake } from "../tools";

export const blueprintUnstakeAction: Action = {
  name: "UNSTAKE_SOL_FROM_BLUEPRINT",
  similes: [
    "unstake SOL from Blueprint",
    "deactivate Blueprint stake",
    "undelegate from Blueprint",
  ],
  description:
    "Unstake (deactivate) SOL from Blueprint validator. After deactivation completes at the end of the current epoch, the SOL can be withdrawn.",
  examples: [
    [
      {
        input: {
          stakeAccountAddress: "7xKX...",
        },
        output: {
          status: "success",
          message: "Successfully deactivated stake account 7xKX...",
          signature: "5abc...def",
        },
        explanation: "Deactivate a stake account delegated to Blueprint",
      },
    ],
  ],
  schema: z.object({
    stakeAccountAddress: z
      .string()
      .describe("The stake account address to deactivate"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await blueprintUnstake(
        agent,
        input.stakeAccountAddress,
      );

      return {
        status: "success",
        message: `Successfully deactivated stake account ${input.stakeAccountAddress}`,
        signature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Blueprint unstaking failed: ${error.message}`,
      };
    }
  },
};
