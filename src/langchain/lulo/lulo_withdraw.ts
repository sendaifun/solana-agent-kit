import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaLuloWithdrawTool extends Tool {
  name = "solana_lulo_withdraw";
  description = `Withdraw token USDC using Lulo. (support USDC/PYUSD/USDS/USDT/SOL/jitoSOL/bSOL/mSOL/BONK/JUP)
    Inputs (input is a json string):
    mintAddress: string, eg "So11111111111111111111111111111111111111112" (required)
    amount: number, eg 1, 0.01 (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const mintAddress = parsedInput.mintAddress;
      const amount = parsedInput.amount;

      const tx = await this.solanaKit.luloWithdraw(mintAddress, amount);

      return JSON.stringify({
        status: "success",
        message: "Asset withdraw successfully",
        transaction: tx,
        amount,
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
