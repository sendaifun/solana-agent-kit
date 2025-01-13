import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import Decimal from "decimal.js";

export class SolanaDepositTo2by2Multisig extends Tool {
  name = "deposit_to_2by2_multisig";
  description = `Deposit funds to a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.

  Inputs (JSON string):
  - amount: number, the amount to deposit in SOL (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const amount = new Decimal(inputFormat.amount);

      const tx = await this.solanaKit.depositToMultisig(amount.toNumber());

      return JSON.stringify({
        status: "success",
        message: "Funds deposited to 2-by-2 multisig account successfully",
        transaction: tx,
        amount: amount.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DEPOSIT_TO_2BY2_MULTISIG_ERROR",
      });
    }
  }
}
