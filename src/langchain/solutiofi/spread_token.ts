import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaSpreadTokenTool extends Tool {
  name = "spread_token";
  description = `Spread token using SolutioFi protocol.

  Inputs (input is a JSON string):
  - owner: string, the wallet address of the owner (required)
  - inputAsset: string, the asset to be distributed (required)
    - mint: string, the mint address of the input token (required)
    - inputAmount: string, the amount of the input token (required)
    - slippage: string, slippage percentage allowed (required)
    - onlyDirectRoutes: boolean, whether to use only direct swap routes (required)
  - targetTokens: string, an array of target tokens and their distribution percentages (required)
    - mint: string, the mint address of the target token (required)
    - percentage: number, the percentage of the input amount to allocate (required)
  - priorityFee: string, priority level for the transaction, allowed values: "fast", "normal", "slow" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { inputAsset, targetTokens, priorityFee } = JSON.parse(input);
      const result = await this.solanaKit.spreadToken(
        inputAsset,
        targetTokens,
        priorityFee,
      );
      return JSON.stringify({
        status: "success",
        result,
      });
    } catch (error: any) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  }
}
