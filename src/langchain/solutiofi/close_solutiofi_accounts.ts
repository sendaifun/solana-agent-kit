import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCloseAccountsTool extends Tool {
  name = "close_solutiofi_accounts";
  description = `Close token accounts using SolutioFi protocol.
  
  Inputs (JSON string):
  - mints: string, Array of mint ids of token accounts to close (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { mints } = JSON.parse(input);
      const transactions = await this.solanaKit.closeAccounts(mints);
      return JSON.stringify({
        status: "success",
        transactions,
      });
    } catch (error: any) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  }
}
