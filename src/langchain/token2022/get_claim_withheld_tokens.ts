import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetClaimWithheldTokensTool extends Tool {
  name = "solana_claim_withheld_tokens";
  description = `This tool claims all withheld tokens for a given mint.

  Inputs (input is a JSON string):
  mint: string, e.g., "So11111111111111111111111111111111111111112" (required)
  authority: string, e.g., "AuthorityPublicKeyString" (required)
  srcAccounts: string[], e.g., ["Account1PubKey", "Account2PubKey"] (required)
  payer?: string, e.g., "PayerPublicKeyString" (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signatures = await this.solanaKit.getClaimWithheldTokens(
        new PublicKey(parsedInput.mint),
        new PublicKey(parsedInput.authority),
        parsedInput.srcAccounts.map((acc: string) => new PublicKey(acc)),
        parsedInput.payer ? new PublicKey(parsedInput.payer) : undefined,
      );

      return JSON.stringify({
        status: "success",
        message: "Claimed withheld tokens successfully",
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
