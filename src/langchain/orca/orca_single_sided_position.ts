import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaOrcaOpenSingleSidedPosition extends Tool {
  name = "orca_open_single_sided_position";
  description = `Add liquidity to a CLMM by opening a single-sided position in an Orca Whirlpool, the most efficient liquidity pool on Solana.

  Inputs (JSON string):
  - whirlpoolAddress: string, address of the Orca Whirlpool (required).
  - distanceFromCurrentPriceBps: number, distance in basis points from the current price for the position (required).
  - widthBps: number, width of the position in basis points (required).
  - inputTokenMint: string, mint address of the deposit token (required).
  - inputAmount: number, amount of the deposit token, e.g., 100.0 (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const whirlpoolAddress = new PublicKey(inputFormat.whirlpoolAddress);
      const distanceFromCurrentPriceBps =
        inputFormat.distanceFromCurrentPriceBps;
      const widthBps = inputFormat.widthBps;
      const inputTokenMint = new PublicKey(inputFormat.inputTokenMint);
      const inputAmount = new Decimal(inputFormat.inputAmount);

      if (distanceFromCurrentPriceBps < 0 || widthBps < 0) {
        throw new Error(
          "Invalid distanceFromCurrentPriceBps or width. It must be equal or greater than 0.",
        );
      }

      const txId = await this.solanaKit.orcaOpenSingleSidedPosition(
        whirlpoolAddress,
        distanceFromCurrentPriceBps,
        widthBps,
        inputTokenMint,
        inputAmount,
      );

      return JSON.stringify({
        status: "success",
        message: "Single-sided liquidity position opened successfully.",
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
