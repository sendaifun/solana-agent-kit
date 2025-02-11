import { Tool } from "langchain/tools";
import type { SolanaAgentKit } from "../../agent";

export class SolanaDriftLendAndBorrowAPYTool extends Tool {
  name = "drift_lend_and_borrow_apy";
  description = `Get lending and borrowing APY for a token on Drift protocol.
  
  Inputs (JSON string):
  - symbol: string, token symbol (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const apyInfo = await this.solanaKit.getLendAndBorrowAPY(input);

      return JSON.stringify({
        status: "success",
        message: `APY information retrieved for ${input}`,
        data: apyInfo,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "LEND_AND_BORROW_APY_ERROR",
      });
    }
  }
}
