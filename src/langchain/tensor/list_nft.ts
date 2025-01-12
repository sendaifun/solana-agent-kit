import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaListNFTForSaleTool extends Tool {
  name = "solana_list_nft_for_sale";
  description = `List an NFT for sale on Tensor Trade.

  Inputs (input is a JSON string):
  nftMint: string, the mint address of the NFT (required)
  price: number, price in SOL (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      // Validate NFT ownership first
      const nftAccount =
        await this.solanaKit.connection.getTokenAccountsByOwner(
          this.solanaKit.wallet_address,
          { mint: new PublicKey(parsedInput.nftMint) },
        );

      if (nftAccount.value.length === 0) {
        return JSON.stringify({
          status: "error",
          message:
            "NFT not found in wallet. Please make sure you own this NFT.",
          code: "NFT_NOT_FOUND",
        });
      }

      const tx = await this.solanaKit.tensorListNFT(
        new PublicKey(parsedInput.nftMint),
        parsedInput.price,
      );

      return JSON.stringify({
        status: "success",
        message: "NFT listed for sale successfully",
        transaction: tx,
        price: parsedInput.price,
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
