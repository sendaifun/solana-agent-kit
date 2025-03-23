import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetStakingYieldsTool extends Tool {
  name = "solana_get_staking_yields";
  description = `Get staking yields for SOL on Kamino.`

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const result = await this.solanaKit.getKaminoStakingYields();
      return JSON.stringify({
        status: "success",
        message: "Staking yields retrieved successfully",
        result,
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
