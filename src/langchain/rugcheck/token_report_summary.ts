import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaFetchTokenReportSummaryTool extends Tool {
  name = "solana_fetch_token_report_summary";
  description = `Fetches a summary report for a specific token from RugCheck.
  Inputs:
  - mint: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const mint = input.trim();
      const report = await this.solanaKit.fetchTokenReportSummary(mint);

      return JSON.stringify({
        status: "success",
        message: "Token report summary fetched successfully",
        report,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TOKEN_REPORT_SUMMARY_ERROR",
      });
    }
  }
}
