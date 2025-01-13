import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaParseTransactionHeliusTool extends Tool {
  name = "solana_parse_transaction_helius";
  description = `Parse a Solana transaction using Helius API.
    Inputs:
    - transactionId: string, the ID of the transaction to parse, e.g., "5h3k...9d2k" (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<any> {
    try {
      const transactionId = input.trim();
      const parsedTransaction =
        await this.solanaKit.heliusParseTransactions(transactionId);
      return JSON.stringify({
        status: "success",
        message: "transaction parsed successfully",
        transaction: parsedTransaction,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "NOt able to Parse transaction",
      });
    }
  }
}
