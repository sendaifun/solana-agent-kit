import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCreateDriftUserAccountTool extends Tool {
  name = "create_drift_user_account";
  description = `Create a new user account with a deposit on Drift protocol.
  
  Inputs (JSON string):
  - amount: number, amount of the token to deposit (required)
  - symbol: string, symbol of the token to deposit (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const res = await this.solanaKit.createDriftUserAccount(
        parsedInput.amount,
        parsedInput.symbol,
      );

      return JSON.stringify({
        status: "success",
        message: `User account created with ${parsedInput.amount} ${parsedInput.symbol} successfully deposited`,
        account: res.account,
        signature: res.txSignature,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "CREATE_DRIFT_USER_ACCOUNT_ERROR",
      });
    }
  }
}
