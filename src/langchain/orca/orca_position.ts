import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaClosePosition extends Tool {
  name = "orca_close_position";
  description = `Closes an existing liquidity position in an Orca Whirlpool. This function fetches the position
  details using the provided mint address and closes the position with a 1% slippage.

  Inputs (JSON string):
  - positionMintAddress: string, the address of the position mint that represents the liquidity position.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const positionMintAddress = new PublicKey(
        inputFormat.positionMintAddress,
      );

      const txId = await this.solanaKit.orcaClosePosition(positionMintAddress);

      return JSON.stringify({
        status: "success",
        message: "Liquidity position closed successfully.",
        transaction: txId,
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
