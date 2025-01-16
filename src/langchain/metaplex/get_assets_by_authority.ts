import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetAssetsByAuthorityTool extends Tool {
  name = "solana_get_assets_by_authority";
  description = `Fetch a list of assets owned by a specific address using the Metaplex DAS API.

  Inputs (input is a JSON string):
  authority: string, eg "mRdta4rc2RtsxEUDYuvKLamMZAdW6qHcwuq866Skxxv" (required)
  sortBy: { sortBy: "created" | "updated" | "recentAction" | "none", sortDirection: "asc" | "desc" } (optional)
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

      const result = await this.solanaKit.getAssetsByAuthority(parsedInput);

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
