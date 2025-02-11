import { Tool } from "langchain/tools";
import type { SolanaAgentKit } from "../../agent";

export class SolanaStakeToDriftInsuranceFundTool extends Tool {
  name = "stake_to_drift_insurance_fund";
  description = `Stake a token to Drift Insurance Fund.
  
  Inputs (JSON string):
  - amount: number, amount to stake (required)
  - symbol: string, token symbol (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.stakeToDriftInsuranceFund(
        parsedInput.amount,
        parsedInput.symbol,
      );

      return JSON.stringify({
        status: "success",
        message: `Staked ${parsedInput.amount} ${parsedInput.symbol} to the Drift Insurance Fund`,
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "STAKE_TO_DRIFT_INSURANCE_FUND_ERROR",
      });
    }
  }
}
