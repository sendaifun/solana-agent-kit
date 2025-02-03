import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaUpdateDriftVaultDelegateTool extends Tool {
  name = "update_drift_vault_delegate";
  description = `Update the delegate of a drift vault.
  
  Inputs (JSON string):
  - vaultAddress: string, address of the vault (required)
  - newDelegate: string, address of the new delegate (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.updateDriftVaultDelegate(
        parsedInput.vaultAddress,
        parsedInput.newDelegate,
      );

      return JSON.stringify({
        status: "success",
        message: "Vault delegate updated successfully",
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UPDATE_DRIFT_VAULT_DELEGATE_ERROR",
      });
    }
  }
}
