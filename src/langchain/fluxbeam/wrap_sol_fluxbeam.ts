import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaFluxbeamWrapSOLTool extends Tool {
  name = "solana_fluxbeam_wrap_sol";
  description = `Wraps SOL into wSOL for the specified amount in SOL

  Inputs (input is a JSON string):
  amount: number, eg 0.0012 (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      console.log(`this is the input ${input}`);
      const parsedInput = JSON.parse(input);
      // console.log(`this is the input ${input}}`);
      console.log(`this is the ${JSON.stringify(parsedInput)}`);
      const signature = await this.solanaKit.fluxbeamWrapSOL(
        parsedInput.amount,
      );
      return JSON.stringify({
        status: "success",
        message: "SOL wrapped successfully",
        transaction: signature,
        amount: parsedInput.amount,
      });
    } catch (error: any) {
      console.log(
        `this is the error stringified ${JSON.stringify({
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        })}`,
      );
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
