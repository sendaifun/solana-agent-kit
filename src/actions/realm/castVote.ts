import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { z } from "zod";
import { castGovernanceVote } from "../../tools";
import { SolanaAgentKit } from "../../agent";

const castGovernanceVoteAction: Action = {
  name: "CAST_GOVERNANCE_VOTE",
  similes: [
    "vote on proposal",
    "cast governance vote",
    "submit proposal vote",
    "vote on governance",
    "vote on dao proposal",
  ],
  description: `Cast a vote on a governance proposal in a Solana DAO.

  Inputs ( input is a JSON string ):
  realmAccount: string, eg "7nxQB..." (required) - The public key of the realm
  proposalAccount: string, eg "8x2dR..." (required) - The public key of the proposal
  voteType: string, either "yes" or "no" (required) - The type of vote to cast`,

  examples: [
    [
      {
        input: {
          realmAccount: "7nxQB1nGrqk8WKXeFDR6ZUaQtYjV7HMsAGWgwtGHwmQU",
          proposalAccount: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
          voteType: "yes",
        },
        output: {
          status: "success",
          signature: "2GjfL3N9E4cHp7WhDZRkx7oF2J9m3Sf5hT6zRHcVWUjp",
          message: "Vote cast successfully",
        },
        explanation: "Cast a yes vote on a governance proposal",
      },
    ],
  ],

  schema: z.object({
    realmAccount: z.string().min(32, "Invalid realm account address"),
    proposalAccount: z.string().min(32, "Invalid proposal account address"),
    voteType: z.enum(["yes", "no"], {
      description: "Vote type must be either 'yes' or 'no'",
    }),
  }),

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await castGovernanceVote(
        agent,
        new PublicKey(input.realmAccount),
        new PublicKey(input.proposalAccount),
        input.voteType,
      );

      return {
        status: "success",
        signature,
        message: "Vote cast successfully",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to cast vote: ${error.message}`,
      };
    }
  },
};

export default castGovernanceVoteAction;
