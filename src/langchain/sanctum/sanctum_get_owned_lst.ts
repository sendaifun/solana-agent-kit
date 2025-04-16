import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SanctumGetOwnedLSTTool extends Tool {
  name = "sanctum_get_owned_lst";
  description = `Fetch the owned LST(Liquid Staking Token) on Sanctum with specified account`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(): Promise<string> {
    try {
      const lsts = await this.solanaKit.getSanctumOwnedLST();

      return JSON.stringify({
        status: "success",
        message: "Owned LSTs fetched successfully",
        lsts,
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
