import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { Action } from "../../types";

const getVoterHistoryAction: Action = {
  name: "SPL_GET_VOTER_HISTORY",
  similes: [
    "check voting history",
    "view past votes",
    "retrieve voter record",
    "get dao participation history",
    "review governance activity",
    "check vote records",
  ],
  description: "Get voting history for a specific voter across proposals",
  examples: [
    [
      {
        input: {
          voter: "DqYm...",
        },
        output: {
          status: "success",
          voterHistory: [
            {
              proposal: "2ZE7Rz...",
              vote: "Approve",
              timestamp: 1672531200,
            },
         
          ],
          message: "Successfully retrieved voter history",
        },
        explanation: "Retrieve a complete voting record for a DAO participant",
      },
    ],
  ],
  schema: z.object({
    voter: z.string().min(1).describe("Address of the voter"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await agent.getVoterHistory(new PublicKey(input.voter));

      return {
        status: "success",
        voterHistory: result,
        message: "Successfully retrieved voter history",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get voter history: ${error.message}`,
      };
    }
  },
};


export default getVoterHistoryAction;