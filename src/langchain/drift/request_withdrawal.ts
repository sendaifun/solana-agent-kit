import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaRequestDriftWithdrawalTool extends Tool {
  name = "request_withdrawal_from_drift_vault";
  description = `Request a withdrawal from an existing drift vault.
  
  Inputs (JSON string):
  - vaultAddress: string, vault address (required)
  - amount: number, amount of shares to withdraw (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.requestWithdrawalFromDriftVault(
        parsedInput.amount,
        parsedInput.vaultAddress,
      );

      return JSON.stringify({
        status: "success",
        message: "Withdrawal request successful",
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "REQUEST_DRIFT_WITHDRAWAL_ERROR",
      });
    }
  }
}
