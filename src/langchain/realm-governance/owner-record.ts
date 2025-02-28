import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";

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