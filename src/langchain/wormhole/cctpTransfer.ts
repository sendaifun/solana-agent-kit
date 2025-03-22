import { Tool } from "@langchain/core/tools";
import { SolanaAgentKit } from "../../agent";
import { CctpTransferInput } from "../../types";

export class CctpTransferTool extends Tool {
  name = "cctpTransfer";
  description = `Transfer USDC from Solana to another chain.

  Inputs (input is a JSON string):
  - destinationChain: string, eg "Ethereum" or "BaseSepolia"
  - transferAmount: string, eg "1"
  - network: string, eg "Mainnet" or "Testnet"
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input) as CctpTransferInput;
      const result = await this.solanaKit.cctpTransfer(parsedInput);

      return JSON.stringify({
        status: "success",
        message: "USDC transferred successfully",
        result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}
