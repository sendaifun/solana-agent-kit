import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SanctumGetTvlTool extends Tool {
  name = "sanctum_get_tvl";
  description = `Fetch the TVL of a LST(Liquid Staking Token) list on the Sanctum with specified mint addresses or symbols.
  
  Inputs (input is a JSON string):
  inputs: string[], eg ["INF", "pwrsol", "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "laineSOL"] (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tvls = await this.solanaKit.getSanctumTvl(parsedInput.inputs);

      return JSON.stringify({
        status: "success",
        message: "TVL fetched successfully",
        tvls,
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
