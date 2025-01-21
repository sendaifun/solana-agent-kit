import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { BN } from "bn.js";

export class SolanaMeteoraCreateDlmmPool extends Tool {
  name = "meteora_create_dlmm_pool";
  description = `Create a Meteora DLMM Pool. This function doesn't add liquidity.
  
  Inputs (JSON string):
  - tokenAMint: string, token A mint (required).
  - tokenBMint: string, token B mint (required).
  - binStep: number, pool bin step, e.g., 20 (required).
  - initialPrice: number, pool initial price, e.g., 0.25 (required).
  - feeBps: number, trade fee in percentage, e.g. 20 for 0.2% (required).
  - priceRoundingUp: boolean, whether the initial price should be rounded up or not, default is true (optional).
  - activationType: number, pool start trading time indicator. 0 is slot and 1 is timestamp, default is 1 for timestamp (optional).
  - activationPoint: number, pool start trading slot / timestamp, default is null means pool can start trading immediately (optional).
  - hasAlphaVault: boolean, whether the pool supports alpha vault, default is false (optional).
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      interface CreateMeteoraDlmmPoolInput {
        tokenAMint: string;
        tokenBMint: string;
        binStep: number;
        initialPrice: number;
        feeBps: number;
        priceRoundingUp?: boolean;
        activationType?: number;
        activationPoint?: number;
        hasAlphaVault?: boolean;
      }
      const inputFormat: CreateMeteoraDlmmPoolInput = JSON.parse(input);

      const tokenAMint = new PublicKey(inputFormat.tokenAMint);
      const tokenBMint = new PublicKey(inputFormat.tokenBMint);
      const binStep = inputFormat.binStep;
      const initialPrice = inputFormat.initialPrice;
      const feeBps = inputFormat.feeBps;
      const priceRoundingUp = inputFormat.priceRoundingUp ?? true;
      const activationType = inputFormat.activationType ?? 1;
      const activationPoint = inputFormat.activationPoint
        ? new BN(inputFormat.activationPoint)
        : undefined;
      const hasAlphaVault = inputFormat.hasAlphaVault ?? false;

      const txId = await this.solanaKit.meteoraCreateDlmmPool(
        tokenAMint,
        tokenBMint,
        binStep,
        initialPrice,
        priceRoundingUp,
        feeBps,
        activationType,
        hasAlphaVault,
        activationPoint,
      );

      return JSON.stringify({
        status: "success",
        message: "Meteora DLMM pool created successfully.",
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
