import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetAssetTool extends Tool {
  name = "solana_get_asset";
  description = `Fetch asset details using the Metaplex DAS API.

  Inputs (input is a JSON string):
  assetId: string, eg "Asset ID" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.getAsset(parsedInput.assetId);

      return JSON.stringify({
        status: "success",
        message: "Asset retrieved successfully",
        result,
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
