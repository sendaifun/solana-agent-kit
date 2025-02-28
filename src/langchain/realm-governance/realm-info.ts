import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";

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