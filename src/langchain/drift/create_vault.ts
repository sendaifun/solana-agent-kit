import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCreateDriftVaultTool extends Tool {
  name = "create_drift_vault";
  description = `Create a new drift vault delegating the agents address as the owner.
  
  Inputs (JSON string):
  - name: string, unique vault name (min 5 chars)
  - marketName: string, market name in TOKEN-SPOT format
  - redeemPeriod: number, days to wait before funds can be redeemed (min 1)
  - maxTokens: number, maximum tokens vault can accommodate (min 100)
  - minDepositAmount: number, minimum deposit amount
  - managementFee: number, fee percentage for managing funds (max 20)
  - profitShare: number, profit sharing percentage (max 90, default 5)
  - hurdleRate: number, optional hurdle rate
  - permissioned: boolean, whether vault has whitelist`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.createDriftVault(parsedInput);

      return JSON.stringify({
        status: "success",
        message: "Drift vault created successfully",
        vaultName: parsedInput.name,
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "CREATE_DRIFT_VAULT_ERROR",
      });
    }
  }
}
