import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetAssetsByCreatorTool extends Tool {
  name = "solana_get_assets_by_creator";
  description = `Fetch a list of assets created by a specific address using the Metaplex DAS API.

  Inputs (input is a JSON string):
  creator: string, eg "D3XrkNZz6wx6cofot7Zohsf2KSsu2ArngNk8VqU9cTY3" (required)
  onlyVerified: boolean (optional)
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

      const result = await this.solanaKit.getAssetsByCreator(parsedInput);

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
