import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaDepositToDriftUserAccountTool extends Tool {
  name = "deposit_to_drift_user_account";
  description = `Deposit funds into your drift user account.
  
  Inputs (JSON string):
  - amount: number, amount to deposit (required)
  - symbol: string, token symbol (required)
  - repay: boolean, whether to repay borrowed funds (optional, default: false)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.depositToDriftUserAccount(
        parsedInput.amount,
        parsedInput.symbol,
        parsedInput.repay,
      );

      return JSON.stringify({
        status: "success",
        message: "Funds deposited successfully",
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DEPOSIT_TO_DRIFT_ACCOUNT_ERROR",
      });
    }
  }
}
