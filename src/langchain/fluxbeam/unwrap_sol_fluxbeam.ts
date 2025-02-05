import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaFluxbeamUnwrapSOLTool extends Tool {
  name = "solana_fluxbeam_unwrap_sol";
  description = `This tool unwraps wSOL back into SOL for the user's wallet.
    
    Inputs (input is a JSON string):
    amount: number in SOL, eg 0.0012 (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const signature = await this.solanaKit.fluxbeamUnwrapSOL(
        parsedInput.amount,
      );

      return JSON.stringify({
        status: "success",
        message: "wSOL unwrapped successfully",
        transaction: signature,
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
