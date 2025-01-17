import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaTradeDelegatedDriftVaultTool extends Tool {
  name = "trade_delegated_drift_vault";
  description = `Carry out trades in a Drift vault.
  
  Inputs (JSON string):
  - vaultAddress: string, address of the Drift vault
  - amount: number, amount to trade
  - symbol: string, symbol of the token to trade
  - action: "long" | "short", trade direction
  - type: "market" | "limit", order type
  - price: number, optional limit price`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.tradeUsingDelegatedDriftVault(
        parsedInput.vaultAddress,
        parsedInput.amount,
        parsedInput.symbol,
        parsedInput.action,
        parsedInput.type,
        parsedInput.price,
      );

      return JSON.stringify({
        status: "success",
        message:
          parsedInput.type === "limit"
            ? "Order placed successfully"
            : "Trade successful",
        transactionId: tx,
        ...parsedInput,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "TRADE_DRIFT_VAULT_ERROR",
      });
    }
  }
}
