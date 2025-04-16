import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SanctumSwapLSTTool extends Tool {
  name = "sanctum_swap_lst";
  description = `Swap LST(Liquid Staking Token) on Sanctum.
  
  Inputs (input is a JSON string):
  inputLstMint: string, eg "So11111111111111111111111111111111111111112" (required)
  amount: string, eg "1000000000" (required)
  quotedAmount: string, eg "900000000" (required)
  priorityFee: number, eg 5000 (required)
  outputLstMint: string, eg "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1" (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const result = await this.solanaKit.swapSanctumLST(
        parsedInput.inputLstMint,
        parsedInput.amount,
        parsedInput.quotedAmount,
        parsedInput.priorityFee,
        parsedInput.outputLstMint,
      );

      return JSON.stringify({
        status: "success",
        message: "LST swapped successfully",
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
