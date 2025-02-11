import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaBurnTokensTool extends Tool {
  name = "burn_solutiofi_tokens";
  description = `Burn tokens using SolutioFi protocol.
  
  Inputs (JSON string):
  - mints: string, mint ids of tokens to burn (required).
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      if (
        !Array.isArray(parsedInput.mints) ||
        parsedInput.mints.some((mint: string) => typeof mint !== "string")
      ) {
        throw new Error("mints must be an array of valid string addresses.");
      }

      const { mints } = parsedInput;
      const transactions = await this.solanaKit.burnTokens(mints);
      return JSON.stringify({
        status: "success",
        transactions,
      });
    } catch (error: any) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  }
}
