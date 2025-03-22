import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaParseAccountTool extends Tool {
  name = "solana_parse_account";
  description = `Parse a Solana account data on Solana blockchain.
  
  Inputs (input is a JSON string):
  programId: string, eg "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" (required)
  accountData: string, eg "AQAAAKNtpf5xH4vTOhHcj+c7iFOBtiodZCZHvMJUCmaAWfmwAMqaOwAAAAAGAQEAAAAngUPsMTO0Ea8yotiDMEigFh6e3Pq4ZJzsKSQdW3kXsg==" (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.parseAccount(
        parsedInput.programId,
        parsedInput.accountData,
      );

      return JSON.stringify({
        status: "success",
        message: "Account data parsed successfully",
        programName: result.name,
        layout: result.layout,
        data: result.data,
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
