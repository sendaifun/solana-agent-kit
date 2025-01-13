import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaRestakeTool extends Tool {
  name = "solana_restake";
  description = `This tool can be used to restake your SOL on Solayer to receive Solayer SOL (sSOL) as a Liquid Staking Token (LST).

  Inputs:
  amount: number, eg 1 or 0.01 (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input) || Number(input);

      const tx = await this.solanaKit.restake(parsedInput.amount);

      return JSON.stringify({
        status: "success",
        message: "Staked successfully",
        transaction: tx,
        amount: parsedInput.amount,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
