import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaWithdrawFromDriftAccountTool extends Tool {
  name = "withdraw_from_drift_account";
  description = `Withdraw or borrow funds from your drift account.
  
  Inputs (JSON string):
  - amount: number, amount to withdraw (required)
  - symbol: string, token symbol (required)
  - isBorrow: boolean, whether to borrow funds instead of withdrawing (optional, default: false)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.withdrawFromDriftAccount(
        parsedInput.amount,
        parsedInput.symbol,
        parsedInput.isBorrow,
      );

      return JSON.stringify({
        status: "success",
        message: "Funds withdrawn successfully",
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "WITHDRAW_FROM_DRIFT_ACCOUNT_ERROR",
      });
    }
  }
}
