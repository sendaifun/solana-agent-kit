import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { BN } from "bn.js";
import { MintLayout } from "@solana/spl-token";
import Decimal from "decimal.js";

export class SolanaMeteoraCreateDynamicPool extends Tool {
  name = "meteora_create_dynamic_pool";
  description = `Create a Meteora Dynamic Pool. This function adds liquidity with a constant-product formula.
  
  Inputs (JSON string):
  - tokenAMint: string, token A mint (required).
  - tokenBMint: string, token B mint (required).
  - tokenAAmount: number, token A amount not including decimals, e.g., 1 (required).
  - tokenBAmount: number, token B amount not including decimals, e.g., 0.2 (required).
  - tradeFeeNumerator: number, trade fee numerator, e.g., 2500 for 2.5% (required).
  - activationType: number, pool start trading time indicator, 0 is slot and 1 is timestamp, default is 1 for timestamp (optional).
  - activationPoint: number, pool start trading slot / timestamp, default is null means pool can start trading immediately (optional).
  - hasAlphaVault: boolean, whether the pool supports alpha vault, default is false (optional).
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      interface CreateMeteoraDynamicAmmPoolInput {
        tokenAMint: string;
        tokenBMint: string;
        tokenAAmount: number;
        tokenBAmount: number;
        tradeFeeNumerator: number;
        activationType?: number;
        activationPoint?: number;
        hasAlphaVault?: boolean;
      }
      const inputFormat: CreateMeteoraDynamicAmmPoolInput = JSON.parse(input);

      const tokenAMint = new PublicKey(inputFormat.tokenAMint);
      const tokenBMint = new PublicKey(inputFormat.tokenBMint);

      const tokenAMintInfo =
        await this.solanaKit.connection.getAccountInfo(tokenAMint);
      const tokenBMintInfo =
        await this.solanaKit.connection.getAccountInfo(tokenBMint);

      if (!tokenAMintInfo) {
        return JSON.stringify({
          status: "error",
          message: "failed to fetch tokenAMint info",
          code: "UNKNOWN_ERROR",
        });
      }
      if (!tokenBMintInfo) {
        return JSON.stringify({
          status: "error",
          message: "failed to fetch tokenBMint info",
          code: "UNKNOWN_ERROR",
        });
      }

      const tokenADecimals = MintLayout.decode(tokenAMintInfo.data).decimals;
      const tokenBDecimals = MintLayout.decode(tokenBMintInfo.data).decimals;

      const tokenAAmount = new BN(
        new Decimal(inputFormat.tokenAAmount)
          .mul(10 ** tokenADecimals)
          .toString(),
      );
      const tokenBAmount = new BN(
        new Decimal(inputFormat.tokenBAmount)
          .mul(10 ** tokenBDecimals)
          .toString(),
      );

      const tradeFeeNumerator = new BN(
        inputFormat.tradeFeeNumerator.toString(),
      ).toNumber();
      const activationType = inputFormat.activationType ?? 1;
      const activationPoint = inputFormat.activationPoint
        ? new BN(inputFormat.activationPoint)
        : null;
      const hasAlphaVault = inputFormat.hasAlphaVault ?? false;

      const txId = await this.solanaKit.meteoraCreateDynamicPool(
        tokenAMint,
        tokenBMint,
        tokenAAmount,
        tokenBAmount,
        tradeFeeNumerator,
        activationPoint,
        hasAlphaVault,
        activationType,
      );

      return JSON.stringify({
        status: "success",
        message: "Meteora Dynamic pool created successfully.",
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
