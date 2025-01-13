import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCancelNFTListingTool extends Tool {
  name = "solana_cancel_nft_listing";
  description = `Cancel an NFT listing on Tensor Trade.

  Inputs (input is a JSON string):
  nftMint: string, the mint address of the NFT (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tx = await this.solanaKit.tensorCancelListing(
        new PublicKey(parsedInput.nftMint),
      );

      return JSON.stringify({
        status: "success",
        message: "NFT listing cancelled successfully",
        transaction: tx,
        nftMint: parsedInput.nftMint,
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
