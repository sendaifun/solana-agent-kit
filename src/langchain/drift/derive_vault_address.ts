import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaDeriveVaultAddressTool extends Tool {
  name = "derive_drift_vault_address";
  description = `Derive a drift vault address from the vault's name.
  
  Inputs (JSON string):
  - name: string, name of the vault to derive the address of (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const address = await this.solanaKit.deriveDriftVaultAddress(input);

      return JSON.stringify({
        status: "success",
        message: "Vault address derived successfully",
        address,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DERIVE_VAULT_ADDRESS_ERROR",
      });
    }
  }
}
