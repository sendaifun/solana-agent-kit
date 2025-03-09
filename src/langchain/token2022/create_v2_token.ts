import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCreateV2TokenTool extends Tool {
  name = "solana_create_v2_token";
  description = `This tool creates a v2 (token2022) token on the Solana blockchain.

  Inputs (input is a JSON string):
  - name: string — Token name (required)
  - symbol: string — Token symbol (required)
  - description?: string — Token description (optional)
  - mintTotalSupply?: boolean — Whether to mint the total supply (default: true)
  - totalSupply: bigint — Total supply of the token (required)
  - extensions: ExtensionConfig[] — Array of token extensions and their custom config objects (required)
  - owner: string — Public key of the owner (required)
  - mintAuthority: PublicKey — Public key of the mint authority (required)
  - freezeAuthority?: PublicKey | null — Public key of the freeze authority (optional)
  - decimals?: number — Number of decimal places (default: 6)
  - metadataUri?: string — URI for the token metadata (optional)
  - imagePath?: string — Local file path of the image (optional)
  - imageUri?: string — URL of the image (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signature = await this.solanaKit.createV2Token(
        parsedInput.name,
        parsedInput.symbol,
        parsedInput.description,
        parsedInput.mintTotalSupply || true,
        parsedInput.totalSupply,
        parsedInput.extensions,
        new PublicKey(parsedInput.owner),
        parsedInput.mintAuthority,
        parsedInput.freezeAuthority,
        parsedInput.decimals || 6,
        parsedInput.metadataURI,
        parsedInput.imageData,
        parsedInput.imageUri,
      );

      return JSON.stringify({
        status: "success",
        message: "Token created successfully",
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
