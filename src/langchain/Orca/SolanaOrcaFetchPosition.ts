import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaOrcaFetchPositions extends Tool {
  name = "orca_fetch_positions";
  description = `Fetch all the liquidity positions in an Orca Whirlpool by owner. Returns an object with positiont mint addresses as keys and position status details as values.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const txId = await this.solanaKit.orcaFetchPositions();

      return JSON.stringify({
        status: "success",
        message: "Liquidity positions fetched.",
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
