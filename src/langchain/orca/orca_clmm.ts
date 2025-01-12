import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { FEE_TIERS } from "../../tools/orca";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaOrcaCreateCLMM extends Tool {
  name = "orca_create_clmm";
  description = `Create a Concentrated Liquidity Market Maker (CLMM) pool on Orca, the most efficient and capital-optimized CLMM on Solana. This function initializes a CLMM pool but does not add liquidity. You can add liquidity later using a centered position or a single-sided position.

  Inputs (JSON string):
  - mintDeploy: string, the mint of the token you want to deploy (required).
  - mintPair: string, The mint of the token you want to pair the deployed mint with (required).
  - initialPrice: number, initial price of mintA in terms of mintB, e.g., 0.001 (required).
  - feeTier: number, fee tier in bps. Options: 1, 2, 4, 5, 16, 30, 65, 100, 200 (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const mintA = new PublicKey(inputFormat.mintDeploy);
      const mintB = new PublicKey(inputFormat.mintPair);
      const initialPrice = new Decimal(inputFormat.initialPrice);
      const feeTier = inputFormat.feeTier;

      if (!feeTier || !(feeTier in FEE_TIERS)) {
        throw new Error(
          `Invalid feeTier. Available options: ${Object.keys(FEE_TIERS).join(
            ", ",
          )}`,
        );
      }

      const txId = await this.solanaKit.orcaCreateCLMM(
        mintA,
        mintB,
        initialPrice,
        feeTier,
      );

      return JSON.stringify({
        status: "success",
        message:
          "CLMM pool created successfully. Note: No liquidity was added.",
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
