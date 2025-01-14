import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { Tool } from "@langchain/core/tools";
import { SolanaAgentKit } from "../../agent";
import { VoteConfig, ProposalConfig } from "../../types/governance";

export class SolanaCreateRealmTool extends Tool {
  name = "create_realm";
  description = "Create a new DAO realm with specified configuration";

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
        name: string;
        communityMint: string;
        minCommunityTokens: number;
        councilMint?: string;
      };

      const result = await this.agent.createRealm({
        name: args.name,
        communityMint: new PublicKey(args.communityMint),
        minCommunityTokensToCreateGovernance: args.minCommunityTokens,
        councilMint: args.councilMint
          ? new PublicKey(args.councilMint)
          : undefined,
      });
      return `Successfully created realm with address: ${result.toString()}`;
    } catch (error) {
      throw new Error(`Failed to create realm: ${error}`);
    }
  }
}

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

export class SolanaCastVoteTool extends Tool {
  name = "cast_vote";
  description = "Cast a vote on a proposal";

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
      const args = JSON.parse(input || "{}") as VoteConfig;
      const result = await this.agent.castVote(args);
      return `Successfully cast vote on proposal: ${result.toString()}`;
    } catch (error) {
      throw new Error(`Failed to cast vote: ${error}`);
    }
  }
}

export class SolanaGetRealmInfoTool extends Tool {
  name = "get_realm_info";
  description = "Get information about a DAO realm";

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
      };

      const result = await this.agent.getRealm(new PublicKey(args.realm));
      return JSON.stringify(result);
    } catch (error) {
      throw new Error(`Failed to get realm info: ${error}`);
    }
  }
}

export class SolanaGetTokenOwnerRecordTool extends Tool {
  name = "get_token_owner_record";
  description = "Get token owner record for a member in a DAO realm";

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
        governingTokenMint: string;
        governingTokenOwner: string;
      };

      const result = await this.agent.getTokenOwnerRecord(
        new PublicKey(args.realm),
        new PublicKey(args.governingTokenMint),
        new PublicKey(args.governingTokenOwner),
      );
      return JSON.stringify(result);
    } catch (error) {
      throw new Error(`Failed to get token owner record: ${error}`);
    }
  }
}

export class SolanaGetVoterHistoryTool extends Tool {
  name = "get_voter_history";
  description = "Get voting history for a specific voter";

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
        voter: string;
      };

      const result = await this.agent.getVoterHistory(
        new PublicKey(args.voter),
      );
      return JSON.stringify(result);
    } catch (error) {
      throw new Error(`Failed to get voter history: ${error}`);
    }
  }
}
