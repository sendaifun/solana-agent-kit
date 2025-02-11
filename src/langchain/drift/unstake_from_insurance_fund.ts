import { Tool } from "langchain/tools";
import type { SolanaAgentKit } from "../../agent";

export class SolanaUnstakeFromDriftInsuranceFundTool extends Tool {
  name = "unstake_from_drift_insurance_fund";
  description = `Unstake tokens from Drift Insurance Fund after request period has elapsed.
  
  Inputs (JSON string):
  - symbol: string, token symbol (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const tx = await this.solanaKit.unstakeFromDriftInsuranceFund(input);

      return JSON.stringify({
        status: "success",
        message: `Unstaked ${input} from the Drift Insurance Fund`,
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNSTAKE_FROM_DRIFT_INSURANCE_FUND_ERROR",
      });
    }
  }
}
