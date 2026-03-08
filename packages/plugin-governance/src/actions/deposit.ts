import { PublicKey } from "@solana/web3.js";
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { governanceDepositTreasury } from "../tools/deposit";

const governanceDepositTreasuryAction: Action = {
  name: "GOVERNANCE_DEPOSIT_TREASURY_ACTION",
  similes: [
    "deposit tokens to dao treasury",
    "fund a governance account",
    "send assets to realms treasury",
    "deposit to governance",
    "transfer to dao treasury",
  ],
  description: `Deposit SOL or SPL tokens into an SPL Governance (Realms) Treasury. 
  Specify the treasury (or governance account) address, amount, and optional token mint.`,
  examples: [
    [
      {
        input: {
          treasury: "7pZ9m1K1WpT9U3Z8Xy8Z4Z5C6G7H8J9K0L1M2N3O4P5Q",
          amount: 5,
        },
        output: {
          status: "success",
          message: "Deposit successful",
          transaction: "5KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Deposit 5 SOL into the specified governance treasury",
      },
    ],
  ],
  schema: z.object({
    treasury: z.string().describe("Governance treasury or account public key"),
    amount: z.number().positive().describe("Amount to deposit"),
    mint: z.string().optional().describe("Token mint address (defaults to SOL)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const txSignature = await governanceDepositTreasury(
        agent,
        new PublicKey(input.treasury),
        input.amount,
        input.mint ? new PublicKey(input.mint) : undefined,
      );

      return {
        status: "success",
        message: "Deposit successful",
        transaction: txSignature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Governance deposit failed: ${error.message}`,
        error: error.message,
      };
    }
  },
};

export default governanceDepositTreasuryAction;
