import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";

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