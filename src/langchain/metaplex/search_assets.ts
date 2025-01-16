import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaSearchAssetsTool extends Tool {
  name = "solana_search_assets";
  description = `Search for assets using various criteria with the Metaplex DAS API.

  Inputs (input is a JSON string):
  negate: boolean (optional)
  conditionType: "all" | "any" (optional)
  interface: string (optional)
  jsonUri: string (optional)
  owner: string (optional)
  ownerType: "single" | "token" (optional)
  creator: string (optional)
  creatorVerified: boolean (optional)
  authority: string (optional)
  grouping: [string, string] (optional)
  delegate: string (optional)
  frozen: boolean (optional)
  supply: number (optional)
  supplyMint: string (optional)
  compressed: boolean (optional)
  compressible: boolean (optional)
  royaltyModel: "creators" | "fanout" | "single" (optional)
  royaltyTarget: string (optional)
  royaltyAmount: number (optional)
  burnt: boolean (optional)
  limit: number (optional)
  page: number (optional)
  before: string (optional)
  after: string (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.searchAssets(parsedInput);

      return JSON.stringify({
        status: "success",
        message: "Assets retrieved successfully",
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
