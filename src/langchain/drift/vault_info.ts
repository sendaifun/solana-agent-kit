import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaDriftVaultInfoTool extends Tool {
  name = "drift_vault_info";
  description = `Get information about a drift vault.
  
  Inputs (JSON string):
  - vaultNameOrAddress: string, name or address of the vault (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const vaultInfo = await this.solanaKit.getDriftVaultInfo(input);

      return JSON.stringify({
        status: "success",
        message: "Vault info retrieved successfully",
        data: vaultInfo,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DRIFT_VAULT_INFO_ERROR",
      });
    }
  }
}
