import { PublicKey } from "@solana/web3.js";
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { governanceCreateProposal } from "../tools/create_proposal";

const governanceCreateProposalAction: Action = {
  name: "GOVERNANCE_CREATE_PROPOSAL_ACTION",
  similes: [
    "create a new proposal",
    "start a proposal",
    "initialize a proposal in realms",
    "spl governance create proposal",
    "realms proposal",
  ],
  description: `Create a new Proposal in SPL Governance (Realms). 
  Specify the program ID, realm, governance, token owner record, name, and description link.`,
  examples: [
    [
      {
        input: {
          programId: "GovER5Lthv3pLBZVvH7y3XmsabB3dB9K6P5xS8Xv",
          realm: "8eN7m1K1WpT9U3Z8Xy8Z4Z5C6G7H8J9K0L1M2N3O4P5Q",
          governance: "9rA8m1K1WpT9U3Z8Xy8Z4Z5C6G7H8J9K0L1M2N3O4P5Q",
          tokenOwnerRecord: "6xY8m1K1WpT9U3Z8Xy8Z4Z5C6G7H8J9K0L1M2N3O4P5Q",
          name: "Increase Fee to 1%",
          descriptionLink: "https://example.com/proposal",
        },
        output: {
          status: "success",
          message: "Proposal created successfully",
          transaction: "5KvgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation: "Create a new proposal in Realms to 'Increase Fee to 1%'",
      },
    ],
  ],
  schema: z.object({
    programId: z.string().describe("SPL Governance program ID"),
    realm: z.string().describe("Realm public key"),
    governance: z.string().describe("Governance public key"),
    tokenOwnerRecord: z.string().describe("Token owner record public key"),
    name: z.string().describe("Name of the proposal"),
    descriptionLink: z.string().url().describe("Link to the proposal description"),
    governingTokenMint: z.string().optional().describe("Governing token mint (default to SOL)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const txSignature = await governanceCreateProposal(
        agent,
        new PublicKey(input.programId),
        new PublicKey(input.realm),
        new PublicKey(input.governance),
        new PublicKey(input.tokenOwnerRecord),
        input.name,
        input.descriptionLink,
        input.governingTokenMint ? new PublicKey(input.governingTokenMint) : undefined,
      );

      return {
        status: "success",
        message: "Proposal created successfully",
        transaction: txSignature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Governance create proposal failed: ${error.message}`,
        error: error.message,
      };
    }
  },
};

export default governanceCreateProposalAction;
