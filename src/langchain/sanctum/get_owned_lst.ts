import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SanctumGetOwnedLstTool extends Tool {
  name = "sanctum_get_owned_lst";
  description = `Fetch the owned LST(Liquid Staking Token) on Sanctum with specified account`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(): Promise<string> {
    try {
      const lsts = await this.solanaKit.getSanctumOwnedLst();

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
