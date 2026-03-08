import { PublicKey } from "@solana/web3.js";
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { governanceVote } from "../tools/vote";

const governanceVoteAction: Action = {
  name: "GOVERNANCE_VOTE_ACTION",
  similes: [
    "vote on a proposal",
    "cast a vote on realms",
    "approve proposal",
    "deny proposal",
    "spl governance vote",
    "realms voting",
  ],
  description: `Vote on a proposal in SPL Governance (Realms). 
  You need the program ID, realm, governance, and proposal public keys.`,
  examples: [
    [
      {
        input: {
          programId: "GovER5Lthv3pLBZVvH7y3XmsabB3dB9K6P5xS8Xv",
          realm: "8eN7m1K1WpT9U3Z8Xy8Z4Z5C6G7H8J9K0L1M2N3O4P5Q",
          governance: "9rA8m1K1WpT9U3Z8Xy8Z4Z5C6G7H8J9K0L1M2N3O4P5Q",
          proposal: "7pZ9m1K1WpT9U3Z8Xy8Z4Z5C6G7H8J9K0L1M2N3O4P5Q",
          tokenOwnerRecord: "6xY8m1K1WpT9U3Z8Xy8Z4Z5C6G7H8J9K0L1M2N3O4P5Q",
          vote: "approve",
        },
        output: {
          status: "success",
          message: "Vote cast successfully",
          transaction: "5KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Cast an approving vote on a proposal in Realms",
      },
    ],
  ],
  schema: z.object({
    programId: z.string().describe("SPL Governance program ID"),
    realm: z.string().describe("Realm public key"),
    governance: z.string().describe("Governance public key"),
    proposal: z.string().describe("Proposal public key"),
    tokenOwnerRecord: z.string().describe("Token owner record public key"),
    vote: z.enum(["approve", "deny"]).describe("Vote type (approve or deny)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const txSignature = await governanceVote(
        agent,
        new PublicKey(input.programId),
        new PublicKey(input.realm),
        new PublicKey(input.governance),
        new PublicKey(input.proposal),
        new PublicKey(input.tokenOwnerRecord),
        input.vote as "approve" | "deny",
      );

      return {
        status: "success",
        message: "Vote cast successfully",
        transaction: txSignature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Governance vote failed: ${error.message}`,
        error: error.message,
      };
    }
  },
};

export default governanceVoteAction;
