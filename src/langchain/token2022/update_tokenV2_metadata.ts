import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaUpdateV2TokenMetadataTool extends Tool {
  name = "solana_update_v2_token_metadata";
  description = `This tool updates metadata for a token using the 2022 standard.

  Inputs (input is a JSON string):
  mint: string, e.g., "Exneu2TBk8Jo45AAFJ43PKH1ZDCVD9mbzHM1CvnFT94i" (required);
  newName: string, token name (optional)
  newSymbol: string, token symbol (optional)
  newUri: string token uri (optional)
  newUpdateAuthority: PublicKey (optional)`;
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signature = this.solanaKit.updateTokenV2Metadata(
        new PublicKey(parsedInput.mint),
        parsedInput.newName ? (parsedInput.newName as string) : undefined,
        parsedInput.newSymbol ? (parsedInput.newSymbol as string) : undefined,
        parsedInput.newUri ? (parsedInput.newUri as string) : undefined,
        parsedInput.newUpdateAuthority
          ? new PublicKey(parsedInput.newUpdateAuthority)
          : undefined,
      );

      return JSON.stringify({
        status: "success",
        message: "Token v2 metadata updated successfully",
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
