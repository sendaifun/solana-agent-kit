import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaManifestCreateMarket extends Tool {
  name = "solana_manifest_create_market";
  description = `Manifest market

  Inputs (input is a json string):
  baseMint: string (required)
  quoteMint: string (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.manifestCreateMarket(
        new PublicKey(inputFormat.baseMint),
        new PublicKey(inputFormat.quoteMint),
      );

      return JSON.stringify({
        status: "success",
        message: "Create manifest market successfully",
        transaction: tx[0],
        marketId: tx[1],
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
