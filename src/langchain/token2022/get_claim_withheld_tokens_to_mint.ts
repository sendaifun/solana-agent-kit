import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetClaimWithheldTokensToMintTool extends Tool {
  name = "solana_claim_withheld_tokens_to_mint";
  description = `This tool harvests withheld tokens to the mint account (permissionless).

  Inputs (input is a JSON string):
  mint: string, e.g., "So11111111111111111111111111111111111111112" (required)
  srcAccounts: string[], e.g., ["Account1PubKey", "Account2PubKey"] (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signatures = await this.solanaKit.getClaimWithheldTokensToMint(
        new PublicKey(parsedInput.mint),
        parsedInput.srcAccounts.map((acc: string) => new PublicKey(acc)),
      );

      return JSON.stringify({
        status: "success",
        message: "Harvested withheld tokens to mint successfully",
        transactions: signatures,
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
