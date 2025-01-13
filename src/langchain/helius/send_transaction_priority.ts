import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaSendTransactionWithPriorityFee extends Tool {
  name = "solana_send_transaction_with_priority_fee";
  description = `Sends a Solana transaction with a user-defined priority fee.
    **Inputs (JSON-encoded string)**:
    - priorityLevel: string — the priority level ("NONE", "Min", "Low", "Medium", "High", "VeryHigh", or "UnsafeMax")
    - amount: number — the amount of SOL to send
    - to: string — the recipient's wallet address (public key in base58);`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { priorityLevel, amount, to, splmintAddress } = JSON.parse(input);

      const validPriorityLevels = [
        "NONE",
        "Min",
        "Low",
        "Medium",
        "High",
        "VeryHigh",
        "UnsafeMax",
      ];
      if (!validPriorityLevels.includes(priorityLevel)) {
        throw new Error(
          `Invalid priority level. Must be one of: ${validPriorityLevels.join(", ")}. Received: ${priorityLevel}`,
        );
      }

      if (!amount || !to) {
        throw new Error(
          `Missing required fields. Received: priorityLevel=${priorityLevel}, amount=${amount}, to=${to}`,
        );
      }

      const toPubkey = new PublicKey(to);
      const priorityFeeTx = await this.solanaKit.sendTranctionWithPriority(
        priorityLevel,
        amount,
        toPubkey,
        splmintAddress,
      );

      return JSON.stringify({
        status: "success",
        message: "Transaction sent successfully",
        priorityFeeTx,
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
