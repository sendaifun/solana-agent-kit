import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaPerpOpenTradeTool extends Tool {
  name = "solana_open_perp_trade";
  description = `This tool can be used to open perpetuals trade ( It uses Adrena Protocol ).

  Inputs ( input is a JSON string ):
  collateralAmount: number, eg 1 or 0.01 (required)
  collateralMint: string, eg "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn" or "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" etc. (optional)
  tradeMint: string, eg "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" etc. (optional)
  leverage: number, eg 50000 = x5, 100000 = x10, 1000000 = x100 (optional)
  price?: number, eg 100 (optional)
  slippage?: number, eg 0.3 (optional)
  side: string, eg: "long" or "short"`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tx =
        parsedInput.side === "long"
          ? await this.solanaKit.openPerpTradeLong({
              price: parsedInput.price,
              collateralAmount: parsedInput.collateralAmount,
              collateralMint: new PublicKey(parsedInput.collateralMint),
              leverage: parsedInput.leverage,
              tradeMint: new PublicKey(parsedInput.tradeMint),
              slippage: parsedInput.slippage,
            })
          : await this.solanaKit.openPerpTradeLong({
              price: parsedInput.price,
              collateralAmount: parsedInput.collateralAmount,
              collateralMint: new PublicKey(parsedInput.collateralMint),
              leverage: parsedInput.leverage,
              tradeMint: new PublicKey(parsedInput.tradeMint),
              slippage: parsedInput.slippage,
            });

      return JSON.stringify({
        status: "success",
        message: "Perpetual trade opened successfully",
        transaction: tx,
        price: parsedInput.price,
        collateralAmount: parsedInput.collateralAmount,
        collateralMint: new PublicKey(parsedInput.collateralMint),
        leverage: parsedInput.leverage,
        tradeMint: new PublicKey(parsedInput.tradeMint),
        slippage: parsedInput.slippage,
        side: parsedInput.side,
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
