import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { ProposalConfig } from "../../types";

export class SolanaCreateProposalTool extends Tool {
  name = "create_proposal";
  description = "Create a new proposal in a DAO realm";

  override schema = z 
    .object({
      input: z.string().optional(),
    })
    .transform((args) => args.input);

  constructor(private agent: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const args = JSON.parse(input || "{}") as {
        realm: string;
        name: string;
        description: string;
        governingTokenMint: string;
        voteType: "single-choice" | "multiple-choice";
      };

      const result = await this.agent.createProposal(
        new PublicKey(args.realm),
        {
          name: args.name,
          description: args.description,
          governingTokenMint: new PublicKey(args.governingTokenMint),
          voteType: args.voteType,
          options: ["Approve", "Deny"],
        } as ProposalConfig,
      );
      return `Successfully created proposal with address: ${result.toString()}`;
    } catch (error) {
      throw new Error(`Failed to create proposal: ${error}`);
    }
  }
}