import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SanctumRemoveLiquidityTool extends Tool {
  name = "sanctum_remove_liquidity";
  description = `Remove liquidity from LST pool on the Sanctum.
  
  Inputs (input is a JSON string):
  lstMint: string, eg "So11111111111111111111111111111111111111112" (required)
  amount: string, eg "1000000000" (required)
  quotedAmount: string, eg "900000000" (required)
  priorityFee: number, eg 5000 (required)  
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.removeSanctumLiquidity(
        parsedInput.lstMint,
        parsedInput.amount,
        parsedInput.quotedAmount,
        parsedInput.priorityFee,
      );

      return JSON.stringify({
        status: "success",
        message: "Liquidity removed successfully",
        txId: result.txId,
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
