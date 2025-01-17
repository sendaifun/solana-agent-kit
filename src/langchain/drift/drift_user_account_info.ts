import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaDriftUserAccountInfoTool extends Tool {
  name = "drift_user_account_info";
  description = `Get information about your drift account.
  
  Inputs: No inputs required - retrieves current user's account info`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(_input: string): Promise<string> {
    try {
      const accountInfo = await this.solanaKit.driftUserAccountInfo();
      return JSON.stringify({
        status: "success",
        data: accountInfo,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DRIFT_ACCOUNT_INFO_ERROR",
      });
    }
  }
}
