import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaMergeTokensTool extends Tool {
  name = "merge_tokens";
  description = `Merge tokens using SolutioFi protocol.
  
  Inputs (input is a JSON string):
  - owner: string, the wallet address of the owner (required)
  - outputMint: string, the mint address of the output token (required)
  - priorityFee: string, priority level for the transaction, allowed values: "fast", "normal", "slow" (required)
  - inputAssets: string, list of input assets (required)
    - mint: string, the mint address of the input token (required)
    - inputAmount: string, the amount of the input token (required)
    - slippage: string, slippage percentage allowed (required)
    - onlyDirectRoutes: boolean, whether to use only direct swap routes (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { inputAssets, outputMint, priorityFee } = JSON.parse(input);
      const result = await this.solanaKit.mergeTokens(
        inputAssets,
        outputMint,
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
