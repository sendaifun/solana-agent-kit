import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetAssetTool extends Tool {
  name = "solana_get_asset";
  description = `Fetch asset details for a given asset ID using the Metaplex DAS API.

  Inputs (input is a string):
  eg "8TrvJBRa6Pzb9BDadqroHhWTHxaxK8Ws8r91oZ2jxaVV" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const result = await this.solanaKit.getAsset(input);

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
