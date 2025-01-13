import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaGetAllAssetsByOwner extends Tool {
  name = "solana_get_all_assets_by_owner";
  description = `Get all assets owned by a specific wallet address.
    Inputs:
    - owner: string, the wallet address of the owner, e.g., "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)
    - limit: number, the maximum number of assets to retrieve (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { owner, limit } = JSON.parse(input);
      const ownerPubkey = new PublicKey(owner);

      const assets = await this.solanaKit.getAllAssetsbyOwner(
        ownerPubkey,
        limit,
      );
      return JSON.stringify({
        status: "success",
        message: "Assets retrieved successfully",
        assets: assets,
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
