import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

export class SolanaVoltrDepositStrategy extends Tool {
  name = "solana_voltr_deposit_strategy";
  description = `Deposit amount into a strategy for Voltr's vaults
    
    Inputs (input is a json string):
    depositAmount: number (required)
    vault: string (required)
    strategy: string (required)
    `;
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }
  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const tx = await this.solanaKit.voltrDepositStrategy(
        new BN(inputFormat.depositAmount),
        new PublicKey(inputFormat.vault),
        new PublicKey(inputFormat.strategy),
      );
      return JSON.stringify({
        status: "success",
        message: `Deposited ${inputFormat.depositAmount} into strategy ${inputFormat.strategy} of vault ${inputFormat.vault} successfully`,
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
