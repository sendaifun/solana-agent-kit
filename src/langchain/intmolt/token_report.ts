import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaIntmoltTokenReportTool extends Tool {
  name = "solana_intmolt_token_report";
  description = `Fetches a security report for a Solana token from integrity.molt.

  integrity.molt queries Solana mainnet directly — it works for any valid mint
  address including brand-new pump.fun tokens, with no pre-indexed database
  required. Returns on-chain risk signals (mint authority, freeze authority,
  supply concentration) plus an AI-generated assessment.

  Use this tool when you need to:
  - Check if a Solana token is safe before trading or investing
  - Detect rug pull risk signals (concentrated supply, mint authority, freeze authority)
  - Get a cryptographically signed security report for a token
  - Scan tokens that Rugcheck does not have indexed yet

  Inputs:
  - mint: string, the mint address of the token (required), e.g., "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"

  Returns: risk level (safe/low/medium/high), on-chain flags, AI assessment text, and Ed25519 signed report.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const mint = input.trim();
      const report = await this.solanaKit.fetchIntmoltTokenReport(mint);

      return JSON.stringify({
        status: "success",
        message: "integrity.molt token report fetched successfully",
        report,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "INTMOLT_TOKEN_REPORT_ERROR",
      });
    }
  }
}
