import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaOrcaOpenCenteredPosition extends Tool {
  name = "orca_open_centered_position_with_liquidity";
  description = `Add liquidity to a CLMM by opening a centered position in an Orca Whirlpool, the most efficient liquidity pool on Solana.

  Inputs (JSON string):
  - whirlpoolAddress: string, address of the Orca Whirlpool (required).
  - priceOffsetBps: number, bps offset (one side) from the current pool price, e.g., 500 for 5% (required).
  - inputTokenMint: string, mint address of the deposit token (required).
  - inputAmount: number, amount of the deposit token, e.g., 100.0 (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const whirlpoolAddress = new PublicKey(inputFormat.whirlpoolAddress);
      const priceOffsetBps = parseInt(inputFormat.priceOffsetBps, 10);
      const inputTokenMint = new PublicKey(inputFormat.inputTokenMint);
      const inputAmount = new Decimal(inputFormat.inputAmount);

      if (priceOffsetBps < 0) {
        throw new Error(
          "Invalid distanceFromCurrentPriceBps. It must be equal or greater than 0.",
        );
      }

      const txId = await this.solanaKit.orcaOpenCenteredPositionWithLiquidity(
        whirlpoolAddress,
        priceOffsetBps,
        inputTokenMint,
        inputAmount,
      );

      return JSON.stringify({
        status: "success",
        message: "Centered liquidity position opened successfully.",
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
