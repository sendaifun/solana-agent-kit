import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";
import { Tool } from "langchain/tools";

export class SolanaCreatePoolFluxBeamTool extends Tool {
  name = "solana_create_pool_fluxbeam";
  description = `This tool can be used to create a new liquidity pool using FluxBeam.
  Inputs ( input is a JSON string ):
  tokenA: string, eg "So11111111111111111111111111111111111111112" (required)
  tokenAAmount: number, eg 100 (required)
  tokenB: string, eg "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (required)
  tokenBAmount: number, eg 200 (required)`;

  constructor(private solanaAgent: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tokenA = new PublicKey(parsedInput.tokenA);
      const tokenAAmount = parsedInput.tokenAAmount;
      const tokenB = new PublicKey(parsedInput.tokenB);
      const tokenBAmount = parsedInput.tokenBAmount;

      const signature = await this.solanaAgent.createPoolFluxBeam(
        tokenA,
        tokenAAmount,
        tokenB,
        tokenBAmount,
      );

      return JSON.stringify({
        status: "success",
        message: "Pool created successfully",
        transaction: signature,
        tokenA: parsedInput.tokenA,
        tokenAAmount: parsedInput.tokenAAmount,
        tokenB: parsedInput.tokenB,
        tokenBAmount: parsedInput.tokenBAmount,
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
