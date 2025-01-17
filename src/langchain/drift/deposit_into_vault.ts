import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaDepositIntoDriftVaultTool extends Tool {
  name = "deposit_into_drift_vault";
  description = `Deposit funds into an existing drift vault.
  
  Inputs (JSON string):
  - vaultAddress: string, address of the vault (required)
  - amount: number, amount to deposit (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.depositIntoDriftVault(
        parsedInput.amount,
        parsedInput.vaultAddress,
      );

      return JSON.stringify({
        status: "success",
        message: "Funds deposited successfully",
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DEPOSIT_INTO_VAULT_ERROR",
      });
    }
  }
}
