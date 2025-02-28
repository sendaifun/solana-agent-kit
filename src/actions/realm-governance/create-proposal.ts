import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { Action } from "../../types";

const createProposalAction: Action = {
  name: "SPL_CREATE_PROPOSAL",
  similes: [
    "create dao proposal",
    "submit governance proposal",
    "initiate dao vote",
    "propose dao action",
    "start governance vote",
    "submit dao motion",
  ],
  description:
    "Create a new proposal in a DAO realm for community or council voting",
  examples: [
    [
      {
        input: {
          realm: "7nxQB...",
          name: "Treasury Funding Allocation",
          description: "Proposal to allocate 1000 tokens to the development team",
          governingTokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          voteType: "single-choice",
        },
        output: {
          status: "success",
          proposalAddress: "2ZE7Rz...",
          message: "Successfully created proposal for community voting",
        },
        explanation:
          "Create a single-choice proposal for community members to vote on",
      },
    ],
  ],
  schema: z.object({
    realm: z.string().min(1).describe("Address of the DAO realm"),
    name: z.string().min(1).describe("Name of the proposal"),
    description: z.string().min(1).describe("Description of the proposal"),
    governingTokenMint: z
      .string()
      .min(1)
      .describe("Token mint address for voting (community or council)"),
    voteType: z
      .enum(["single-choice", "multiple-choice"])
      .describe("Type of voting mechanism for the proposal"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await agent.createProposal(new PublicKey(input.realm), {
        name: input.name,
        description: input.description,
        governingTokenMint: new PublicKey(input.governingTokenMint),
        voteType: input.voteType,
        options: ["Approve", "Deny"],
      });

      return {
        status: "success",
        proposalAddress: result.toString(),
        message: `Successfully created proposal: ${input.name}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create proposal: ${error.message}`,
      };
    }
  },
};


export default createProposalAction;