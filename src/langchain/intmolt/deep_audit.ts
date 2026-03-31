import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaIntmoltDeepAuditTool extends Tool {
  name = "solana_intmolt_deep_audit";
  description = `Runs a deep multi-agent security audit for a Solana token using integrity.molt.

  This tool runs a full swarm pipeline (scanner → analyst → reputation-agent →
  meta-scorecard) and returns an Ed25519-signed report that can be independently
  verified at https://intmolt.org/verify.html — without trusting intmolt.org.

  Use this tool when you need to:
  - Perform a thorough security audit before a large trade or integration
  - Get an aggregate risk score (0–100) with per-agent reasoning
  - Obtain a cryptographically signed, verifiable audit report
  - Understand WHY a token is risky (analyst-agent provides detailed explanation)

  Note: Requires an integrity.molt API key (Builder or Team subscription).
  Set INTMOLT_API_KEY environment variable. Cost: 2.00 USDC per audit.

  Inputs:
  - mint: string, the mint address of the token (required), e.g., "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"

  Returns: aggregate_score (0=safe, 100=dangerous), decision (PASS/WARN/FAIL),
  individual agent outputs, full report text, and Ed25519 signed envelope.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const mint = input.trim();
      const report = await this.solanaKit.fetchIntmoltDeepAudit(mint);

      return JSON.stringify({
        status: "success",
        message: "integrity.molt deep audit completed",
        report,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "INTMOLT_DEEP_AUDIT_ERROR",
      });
    }
  }
}
