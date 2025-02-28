import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { Action, VoteConfig } from "../../types";

const castVoteAction: Action = {
  name: "SPL_CAST_VOTE",
  similes: [
    "vote on proposal",
    "cast dao vote",
    "submit governance vote",
    "vote on dao motion",
    "participate in dao governance",
    "cast ballot on proposal",
  ],
  description: "Cast a vote on an existing proposal in a DAO",
  examples: [
    [
      {
        input: {
          proposal: "2ZE7Rz...",
           tokenOwnerRecord: "8gYZR...",
        },
        output: {
          status: "success",
          voteRecordAddress: "5PmxV...",
          message: "Successfully cast vote on proposal",
        },
        explanation: "Cast a vote on an existing proposal",
      },
    ],
  ],
  schema: z.object({
    proposal: z.string().min(1).describe("Address of the proposal to vote on"),
     tokenOwnerRecord: z
      .string()
      .min(1)
      .describe("Token owner record address for voting"),
    
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
   
      const voteConfig: VoteConfig = {
        proposal: new PublicKey(input.proposal),
        tokenOwnerRecord: new PublicKey(input.tokenOwnerRecord),
        realm: new PublicKey("11111111111111111111111111111111"),  
        choice: 0,
        governingTokenMint: new PublicKey("11111111111111111111111111111111"),  
        governance: new PublicKey("11111111111111111111111111111111")  
      };

      const result = await agent.castVote(voteConfig);

      return {
        status: "success",
        voteRecordAddress: result.toString(),
        message: "Successfully cast vote on proposal",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to cast vote: ${error.message}`,
      };
    }
  },
};

export default castVoteAction;