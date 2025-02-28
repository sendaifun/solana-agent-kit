import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { Action } from "../../types";

const getTokenOwnerRecordAction: Action = {
  name: "SPL_GET_TOKEN_OWNER_RECORD",
  similes: [
    "check dao membership status",
    "get governance token holdings",
    "view dao member record",
    "check voting power",
    "verify dao participation rights",
    "view governance token record",
  ],
  description: "Get token owner record for a member in a DAO realm",
  examples: [
    [
      {
        input: {
          realm: "7nxQB...",
          governingTokenMint: "EPjF...",
          governingTokenOwner: "DqYm...",
        },
        output: {
          status: "success",
          tokenOwnerRecord: {
            governingTokenOwner: "DqYm...",
            tokenBalance: 5000,
            // other member data
          },
          message: "Successfully retrieved token owner record",
        },
        explanation: "Retrieve a member's voting power and participation record",
      },
    ],
  ],
  schema: z.object({
    realm: z.string().min(1).describe("Address of the DAO realm"),
    governingTokenMint: z
      .string()
      .min(1)
      .describe("Token mint address for voting (community or council)"),
    governingTokenOwner: z
      .string()
      .min(1)
      .describe("Address of the token owner/member"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await agent.getTokenOwnerRecord(
        new PublicKey(input.realm),
        new PublicKey(input.governingTokenMint),
        new PublicKey(input.governingTokenOwner)
      );

      return {
        status: "success",
        tokenOwnerRecord: result,
        message: "Successfully retrieved token owner record",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token owner record: ${error.message}`,
      };
    }
  },
};

export default getTokenOwnerRecordAction;