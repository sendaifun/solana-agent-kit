import { AuthorityType } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaRevokeAuthorityTool extends Tool {
  name = "solana_revoke_authority";
  description = `This tool revokes authority for a token mint.

  Inputs (input is a JSON string):
  mint: string, eg "So11111111111111111111111111111111111111112" (required)
  authorityType: string, eg "MintTokens" (required, AuthorityType as a string)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signature = await this.solanaKit.revokeAuthority(
        new PublicKey(parsedInput.mint),
        parsedInput.authority as AuthorityType,
      );

      return JSON.stringify({
        status: "success",
        message: "Mint authority revoked successfully",
        transaction: signature,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
