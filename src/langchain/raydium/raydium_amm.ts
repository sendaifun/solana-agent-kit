import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaRaydiumCreateAmmV4 extends Tool {
  name = "raydium_create_ammV4";
  description = `Raydium's Legacy AMM that requires an OpenBook marketID

  Inputs (input is a json string):
  marketId: string (required)
  baseAmount: number(int), eg: 111111 (required)
  quoteAmount: number(int), eg: 111111 (required)
  startTime: number(seconds), eg: now number or zero (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateAmmV4(
        new PublicKey(inputFormat.marketId),
        new BN(inputFormat.baseAmount),
        new BN(inputFormat.quoteAmount),
        new BN(inputFormat.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Raydium amm v4 pool created successfully",
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
