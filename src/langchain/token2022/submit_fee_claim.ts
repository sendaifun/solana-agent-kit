import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaSubmitFeeClaimTool extends Tool {
  name = "solana_submit_fee_claim";
  description = `This tool can be used to submit a fee claim transaction for a specified mint.

  Inputs (input is a JSON string):
  mint: string, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required)
  payer: string, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signature = await this.solanaKit.submitFeeClaim(
        new PublicKey(parsedInput.payer),
        new PublicKey(parsedInput.mint),
      );

      return JSON.stringify({
        status: "success",
        message: "Fee claim transaction submitted successfully",
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
