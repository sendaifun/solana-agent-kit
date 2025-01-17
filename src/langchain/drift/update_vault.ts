import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaUpdateDriftVaultTool extends Tool {
  name = "update_drift_vault";
  description = `Update an existing drift vault with new settings.
  
  Inputs (JSON string):
  - vaultAddress: string, vault address (required)
  - redeemPeriod: number, days until redemption (optional)
  - maxTokens: number, maximum tokens allowed (optional)
  - minDepositAmount: number, minimum deposit amount (optional)
  - managementFee: number, management fee percentage (optional)
  - profitShare: number, profit sharing percentage (optional)
  - hurdleRate: number, hurdle rate (optional)
  - permissioned: boolean, whitelist requirement (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.updateDriftVault(
        parsedInput.vaultAddress,
        // @ts-expect-error - type mismatch
        {
          hurdleRate: parsedInput.hurdleRate,
          maxTokens: parsedInput.maxTokens,
          minDepositAmount: parsedInput.minDepositAmount,
          profitShare: parsedInput.profitShare,
          managementFee: parsedInput.managementFee,
          permissioned: parsedInput.permissioned,
          redeemPeriod: parsedInput.redeemPeriod,
        },
      );

      return JSON.stringify({
        status: "success",
        message: "Drift vault parameters updated successfully",
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UPDATE_DRIFT_VAULT_ERROR",
      });
    }
  }
}
