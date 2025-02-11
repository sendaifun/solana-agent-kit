import type { Action } from "../../types";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";

const closeAccountsAction: Action = {
  name: "SOLUTIOFI_CLOSE_ACCOUNTS",
  description: "Close specific token accounts using SolutioFi",
  similes: [
    "close token accounts",
    "close accounts with solutiofi",
    "close specific token accounts",
    "close specific spl token account",
    "remove empty accounts",
    "clean up token accounts",
    "close SPL token accounts",
    "delete my empty token accounts",
    "remove unused accounts",
    "disable token accounts",
    "deactivate empty token accounts",
    "clear empty token accounts",
    "reclaim SOL by closing accounts",
    "reclaim rent by closing empty accounts",
    "purge my wallet of empty accounts",
    "I want to close some accounts",
    "help me remove empty token accounts",
    "delete unnecessary accounts",
    "get rid of my empty accounts",
    "close down specific Solana token accounts",
    "remove all zero-balance tokens from my wallet",
    "I want to remove some token accounts",
  ],
  examples: [
    [
      {
        input: {
          mints: ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
        },
        output: {
          status: "success",
          message: "Successfully closed accounts",
          transactions: ["tx_signature"],
        },
        explanation: "Close specified token accounts",
      },
    ],
  ],
  schema: z.object({
    mints: z.array(z.string()).describe("Array of mint addresses to close"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { mints } = input;
      const transactions = await agent.closeAccounts(mints);

      return {
        status: "success",
        transactions,
        message: `Successfully closed ${mints.length} accounts`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to close accounts: ${error.message}`,
        code: error.code || "CLOSE_ACCOUNTS_ERROR",
      };
    }
  },
};

export default closeAccountsAction;
