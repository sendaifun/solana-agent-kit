import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { z } from "zod";
import { getVotingOutcome } from "../../tools";
import { SolanaAgentKit } from "../../agent";

const getVotingOutcomeAction: Action = {
  name: "GET_GOVERNANCE_VOTING_OUTCOME",
  similes: [
    "check proposal votes",
    "get proposal results",
    "view voting outcome",
    "check governance votes",
    "get dao vote status",
  ],
  description: `Get the voting outcome and details for a governance proposal.

 Inputs ( input is a JSON string ):
 proposalAccount: string, eg "8x2dR..." (required) - The public key of the proposal account to check`,

  examples: [
    [
      {
        input: {
          proposalAccount: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
        },
        output: {
          status: "success",
          message: "Successfully retrieved proposal voting outcome",
          data: {
            state: "Voting",
            name: "Treasury Transfer Proposal",
            yesVotes: "1000000",
            noVotes: "500000",
            description: "https://example.com/proposal",
            isVoteFinalized: false,
            votingStartedAt: 1678901234,
            votingCompletedAt: null,
            signatoriesRequired: 3,
            signatoriesSigned: 3,
          },
        },
        explanation: "Get voting outcome for a governance proposal",
      },
    ],
  ],

  schema: z.object({
    proposalAccount: z.string().min(32, "Invalid proposal account address"),
  }),

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const proposal = await getVotingOutcome(
        agent,
        new PublicKey(input.proposalAccount),
      );

      // Format the response with relevant proposal data
      return {
        status: "success",
        message: "Successfully retrieved proposal voting outcome",
        data: {
          state: proposal.state.toString(),
          name: proposal.name,
          yesVotes: proposal.yesVotesCount.toString(),
          noVotes: proposal.noVotesCount.toString(),
          description: proposal.descriptionLink,
          isVoteFinalized: proposal.isVoteFinalized(),
          votingStartedAt: proposal.votingAt?.toNumber() || null,
          votingCompletedAt: proposal.votingCompletedAt?.toNumber() || null,
          signatoriesRequired: proposal.signatoriesCount,
          signatoriesSigned: proposal.signatoriesSignedOffCount,
        },
      };
    } catch (error: any) {
      let errorMessage = error.message;

      if (error.message.includes("Account not found")) {
        errorMessage = "Proposal not found - please check the proposal address";
      }

      return {
        status: "error",
        message: errorMessage,
      };
    }
  },
};

export default getVotingOutcomeAction;
