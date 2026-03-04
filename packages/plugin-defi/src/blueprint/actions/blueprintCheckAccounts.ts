import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { blueprintCheckAccounts } from "../tools";

export const blueprintCheckAccountsAction: Action = {
  name: "CHECK_BLUEPRINT_STAKE_ACCOUNTS",
  similes: [
    "check Blueprint stake accounts",
    "list Blueprint stakes",
    "get my Blueprint staking status",
  ],
  description:
    "Check all stake accounts delegated to Blueprint validator for the agent's wallet. Returns account status, balance, and epoch timing for each stake account.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Found 2 Blueprint stake accounts",
          accounts: [],
        },
        explanation:
          "List all stake accounts for the agent's wallet that are delegated to Blueprint",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, _input: Record<string, any>) => {
    try {
      const data = await blueprintCheckAccounts(agent);

      return {
        status: "success",
        message: `Found ${data.stakeAccounts?.length ?? 0} Blueprint stake accounts`,
        ...data,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to check Blueprint stake accounts: ${error.message}`,
      };
    }
  },
};
