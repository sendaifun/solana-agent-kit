import { PublicKey } from "@solana/web3.js";
import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import {
  castVote,
  getVotingPower,
  delegateVotingPower,
  removeDelegation,
  getVotingOutcome,
} from "../tools/governance";

export const castVoteAction: Action = {
  name: "CAST_VOTE",
  similes: ["vote", "cast ballot", "vote on proposal"],
  description: "Cast a vote on an active governance proposal",
  examples: [
    [
      {
        input: {
          proposal: "4HxrP3R6A6GcUv62VHG331gwJKNhrqHKF438oRztzz2r",
          vote: "yes",
          comment: "I support this proposal",
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Vote cast successfully",
        },
        explanation: "Cast a yes vote with a comment",
      },
    ],
  ],
  schema: z.object({
    proposal: z.string().min(32, "Invalid proposal address"),
    vote: z.enum(["yes", "no", "abstain"]),
    comment: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await castVote(
        agent,
        new PublicKey(input.proposal),
        input.vote,
        input.comment,
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

export const getVotingPowerAction: Action = {
  name: "GET_VOTING_POWER",
  similes: ["check voting power", "get voting weight", "view governance power"],
  description: "Get current voting power in a realm",
  examples: [
    [
      {
        input: {
          realm: "7nxQB...",
          governingTokenMint: "EPjF...",
        },
        output: {
          status: "success",
          votingPower: 1000,
          delegatedPower: 500,
          totalPower: 1500,
        },
        explanation: "Check voting power including delegations",
      },
    ],
  ],
  schema: z.object({
    realm: z.string().min(32, "Invalid realm address"),
    governingTokenMint: z.string().min(32, "Invalid token mint address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const power = await getVotingPower(
        agent,
        new PublicKey(input.realm),
        new PublicKey(input.governingTokenMint),
      );

      return {
        status: "success",
        ...power,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get voting power: ${error.message}`,
      };
    }
  },
};

export const delegateVotingPowerAction: Action = {
  name: "DELEGATE_VOTING_POWER",
  similes: ["delegate votes", "transfer voting power", "assign voting rights"],
  description: "Delegate voting power to another wallet",
  examples: [
    [
      {
        input: {
          realm: "7nxQB...",
          governingTokenMint: "EPjF...",
          delegate: "8x2dR...",
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Voting power delegated successfully",
        },
        explanation: "Delegate voting power to another wallet",
      },
    ],
  ],
  schema: z.object({
    realm: z.string().min(32, "Invalid realm address"),
    governingTokenMint: z.string().min(32, "Invalid token mint address"),
    delegate: z.string().min(32, "Invalid delegate address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await delegateVotingPower(
        agent,
        new PublicKey(input.realm),
        new PublicKey(input.governingTokenMint),
        new PublicKey(input.delegate),
      );

      return {
        status: "success",
        signature,
        message: "Voting power delegated successfully",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to delegate voting power: ${error.message}`,
      };
    }
  },
};

export const getVotingOutcomeAction: Action = {
  name: "GET_VOTING_OUTCOME",
  similes: ["check vote results", "view proposal outcome", "get vote counts"],
  description: "Get the current outcome of a governance proposal vote",
  examples: [
    [
      {
        input: {
          proposal: "4HxrP3R6A6GcUv62VHG331gwJKNhrqHKF438oRztzz2r",
        },
        output: {
          status: "success",
          outcome: {
            status: "Voting",
            yesVotes: 1000000,
            noVotes: 500000,
            abstainVotes: 100000,
            isFinalized: false,
            votingEndTime: 1672531200,
          },
        },
        explanation: "Get detailed voting results for a proposal",
      },
    ],
  ],
  schema: z.object({
    proposal: z.string().min(32, "Invalid proposal address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const outcome = await getVotingOutcome(
        agent,
        new PublicKey(input.proposal),
      );

      return {
        status: "success",
        outcome,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get voting outcome: ${error.message}`,
      };
    }
  },
};
