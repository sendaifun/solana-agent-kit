import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaFluxbeamCreatePoolTool extends Tool {
  name = "fluxbeam_create_pool";
  description = `This tool can be used to create a new token pool using FluxBeam.

  Inputs (input is a JSON string):
  token_a: string, eg "So11111111111111111111111111111111111111112" (required)
  token_a_amount: number, eg 100 or 0.1 (required)
  token_b: string, eg "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" (required)
  token_b_amount: number, eg 200 or 0.2 (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signature = await this.solanaKit.fluxbeamCreatePool(
        new PublicKey(parsedInput.token_a),
        parsedInput.token_a_amount,
        new PublicKey(parsedInput.token_b),
        parsedInput.token_b_amount,
      );

      return JSON.stringify({
        status: "success",
        message: "Token pool created successfully",
        transaction: signature,
        token_a: parsedInput.token_a,
        token_a_amount: parsedInput.token_a_amount,
        token_b: parsedInput.token_b,
        token_b_amount: parsedInput.token_b_amount,
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
