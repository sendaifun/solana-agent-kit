import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaOpenbookCreateMarket extends Tool {
  name = "solana_openbook_create_market";
  description = `Openbook marketId, required for ammv4

  Inputs (input is a json string):
  baseMint: string (required)
  quoteMint: string (required)
  lotSize: number (required)
  tickSize: number (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.openbookCreateMarket(
        new PublicKey(inputFormat.baseMint),
        new PublicKey(inputFormat.quoteMint),

        inputFormat.lotSize,
        inputFormat.tickSize,
      );

      return JSON.stringify({
        status: "success",
        message: "Openbook market created successfully",
        transaction: tx,
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
