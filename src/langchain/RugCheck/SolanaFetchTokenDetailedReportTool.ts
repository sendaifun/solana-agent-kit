import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaFetchTokenDetailedReportTool extends Tool {
  name = "solana_fetch_token_detailed_report";
  description = `Fetches a detailed report for a specific token from RugCheck.
  Inputs:
  - mint: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const mint = input.trim();
      const detailedReport =
        await this.solanaKit.fetchTokenDetailedReport(mint);

      return JSON.stringify({
        status: "success",
        message: "Detailed token report fetched successfully",
        report: detailedReport,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TOKEN_DETAILED_REPORT_ERROR",
      });
    }
  }
}
