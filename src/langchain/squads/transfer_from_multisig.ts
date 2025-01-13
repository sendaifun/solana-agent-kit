import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

export class SolanaTransferFrom2by2Multisig extends Tool {
  name = "transfer_from_2by2_multisig";
  description = `Create a transaction to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.

  Inputs (JSON string):
  - amount: number, the amount to transfer in SOL (required).
  - recipient: string, the public key of the recipient (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const amount = new Decimal(inputFormat.amount);
      const recipient = new PublicKey(inputFormat.recipient);

      const tx = await this.solanaKit.transferFromMultisig(
        amount.toNumber(),
        recipient,
      );

      return JSON.stringify({
        status: "success",
        message: "Transaction added to 2-by-2 multisig account successfully",
        transaction: tx,
        amount: amount.toString(),
        recipient: recipient.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "TRANSFER_FROM_2BY2_MULTISIG_ERROR",
      });
    }
  }
}
