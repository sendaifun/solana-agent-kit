import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetClaimWithheldTokensFromMintTool extends Tool {
  name = "solana_claim_withheld_tokens_from_mint";
  description = `This tool claims withheld tokens from the mint account.

  Inputs (input is a JSON string):
  mint: string, e.g., "So11111111111111111111111111111111111111112" (required)
  payer?: string, e.g., "PayerPublicKeyString" (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signature = await this.solanaKit.getClaimWithheldTokensFromMint(
        new PublicKey(parsedInput.mint),
        parsedInput.payer ? new PublicKey(parsedInput.payer) : undefined,
      );

      return JSON.stringify({
        status: "success",
        message: "Claimed withheld tokens from mint successfully",
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
