import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { z } from "zod";
import { getVotingPower } from "../../tools";
import { SolanaAgentKit } from "../../agent";

const getVotingPowerAction: Action = {
  name: "GET_GOVERNANCE_VOTING_POWER",
  similes: [
    "check voting power",
    "view governance power",
    "get dao voting weight",
    "check vote delegation power",
    "view voting rights",
  ],
  description: `Get current voting power and delegation details for a wallet in a governance realm.

 Inputs ( input is a JSON string ):
 realm: string, eg "7nxQB..." (required) - The public key of the realm
 governingTokenMint: string, eg "8x2dR..." (required) - The mint of the governing token to check power for`,

  examples: [
    [
      {
        input: {
          realm: "7nxQB1nGrqk8WKXeFDR6ZUaQtYjV7HMsAGWgwtGHwmQU",
          governingTokenMint: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
        },
        output: {
          status: "success",
          message: "Successfully retrieved voting power information",
          data: {
            votingPower: 1000000,
            delegatedPower: 500000,
            totalVotesCount: 5,
            unrelinquishedVotesCount: 2,
            outstandingProposalCount: 1,
          },
        },
        explanation:
          "Get current voting power and delegation details for a wallet",
      },
    ],
  ],

  schema: z.object({
    realm: z.string().min(32, "Invalid realm address"),
    governingTokenMint: z
      .string()
      .min(32, "Invalid governing token mint address"),
  }),

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const votingPowerInfo = await getVotingPower(
        agent,
        new PublicKey(input.realm),
        new PublicKey(input.governingTokenMint),
      );

      return {
        status: "success",
        message: "Successfully retrieved voting power information",
        data: {
          votingPower: votingPowerInfo.votingPower,
          delegatedPower: votingPowerInfo.delegatedPower,
          totalVotesCount: votingPowerInfo.totalVotesCount,
          unrelinquishedVotesCount: votingPowerInfo.unrelinquishedVotesCount,
          outstandingProposalCount: votingPowerInfo.outstandingProposalCount,
        },
      };
    } catch (error: any) {
      let errorMessage = error.message;

      // Handle specific error cases
      if (error.message.includes("Account not found")) {
        errorMessage = "No voting record found for this wallet";
      } else if (error.message.includes("Invalid mint")) {
        errorMessage = "Invalid governing token mint provided";
      }

      return {
        status: "error",
        message: errorMessage,
      };
    }
  },
};

export default getVotingPowerAction;
