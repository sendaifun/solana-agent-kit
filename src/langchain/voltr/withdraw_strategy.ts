import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

export class SolanaVoltrWithdrawStrategy extends Tool {
  name = "solana_voltr_withdraw_strategy";
  description = `Withdraw amount from a strategy for Voltr's vaults
    
    Inputs (input is a json string):
    withdrawAmount: number (required)
    vault: string (required)
    strategy: string (required)
    `;
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }
  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const tx = await this.solanaKit.voltrWithdrawStrategy(
        new BN(inputFormat.withdrawAmount),
        new PublicKey(inputFormat.vault),
        new PublicKey(inputFormat.strategy),
      );
      return JSON.stringify({
        status: "success",
        message: `Withdrew ${inputFormat.withdrawAmount} from strategy ${inputFormat.strategy} of vault ${inputFormat.vault} successfully`,
        transaction: tx,
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
