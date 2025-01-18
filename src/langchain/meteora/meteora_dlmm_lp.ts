import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { BN } from "bn.js";

export class SolanaMeteoraCreateDlmmLpPosition extends Tool {
  name = "meteora_create_dlmm_lp_position";
  description = `Create a Meteora DLMM LP position.
  
  Inputs (JSON string):
  - pool: string, pool address (required).
  - totalXAmount: number, total X amount to deposit, e.g., 100 (required).
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      interface CreateMeteoraDlmmLpPositionInput {
        pool: string;
        totalXAmount: number;
      }

      const inputFormat: CreateMeteoraDlmmLpPositionInput = JSON.parse(input);

      const pool = new PublicKey(inputFormat.pool);
      const totalXAmount = new BN(inputFormat.totalXAmount);

      const txId = await this.solanaKit.createMeteoraDlmmLpPosition(
        pool,
        totalXAmount,
      );

      return JSON.stringify({
        status: "success",
        message: "Meteora DLMM LP position created successfully.",
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
