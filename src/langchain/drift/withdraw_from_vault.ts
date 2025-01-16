import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaWithdrawFromDriftVaultTool extends Tool {
  name = "withdraw_from_drift_vault";
  description = `Withdraw funds from a vault given the redemption time has elapsed.
  
  Inputs (JSON string):
  - vaultAddress: string, vault address (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const tx = await this.solanaKit.withdrawFromDriftVault(input);

      return JSON.stringify({
        status: "success",
        message: "Withdrawal successful",
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "WITHDRAW_FROM_DRIFT_VAULT_ERROR",
      });
    }
  }
}
