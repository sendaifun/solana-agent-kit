import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCheckDriftAccountTool extends Tool {
  name = "does_user_have_drift_account";
  description = `Check if a user has a Drift account.
  
  Inputs: No inputs required - checks the current user's account`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(_input: string): Promise<string> {
    try {
      const res = await this.solanaKit.doesUserHaveDriftAccount();

      if (!res.hasAccount) {
        return JSON.stringify({
          status: "error",
          message: "You do not have a Drift account",
        });
      }

      return JSON.stringify({
        status: "success",
        message: "Nice! You have a Drift account",
        account: res.account,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "CHECK_DRIFT_ACCOUNT_ERROR",
      });
    }
  }
}
