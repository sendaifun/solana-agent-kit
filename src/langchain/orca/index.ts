import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import Decimal from "decimal.js";
import { FEE_TIERS } from "../../tools";

export class SolanaClosePosition extends Tool {
  name = "orca_close_position";
  description = `Closes an existing liquidity position in an Orca Whirlpool. This function fetches the position
    details using the provided mint address and closes the position with a 1% slippage.
  
    Inputs (JSON string):
    - positionMintAddress: string, the address of the position mint that represents the liquidity position.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const positionMintAddress = new PublicKey(
        inputFormat.positionMintAddress,
      );

      const txId = await this.solanaKit.orcaClosePosition(positionMintAddress);

      return JSON.stringify({
        status: "success",
        message: "Liquidity position closed successfully.",
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

export class SolanaOrcaCreateSingleSideLiquidityPool extends Tool {
  name = "orca_create_single_sided_liquidity_pool";
  description = `Create a single-sided liquidity pool on Orca, the most efficient and capital-optimized CLMM platform on Solana.

  This function initializes a single-sided liquidity pool, ideal for community driven project, fair launches, and fundraising. Minimize price impact by setting a narrow price range.

  Inputs (JSON string):
  - depositTokenAmount: number, in units of the deposit token including decimals, e.g., 1000000000 (required).
  - depositTokenMint: string, mint address of the deposit token, e.g., "DepositTokenMintAddress" (required).
  - otherTokenMint: string, mint address of the other token, e.g., "OtherTokenMintAddress" (required).
  - initialPrice: number, initial price of the deposit token in terms of the other token, e.g., 0.001 (required).
  - maxPrice: number, maximum price at which liquidity is added, e.g., 5.0 (required).
  - feeTier: number, fee tier for the pool in bps. Options: 1, 2, 4, 5, 16, 30, 65, 100, 200 (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const depositTokenAmount = inputFormat.depositTokenAmount;
      const depositTokenMint = new PublicKey(inputFormat.depositTokenMint);
      const otherTokenMint = new PublicKey(inputFormat.otherTokenMint);
      const initialPrice = new Decimal(inputFormat.initialPrice);
      const maxPrice = new Decimal(inputFormat.maxPrice);
      const feeTier = inputFormat.feeTier;

      if (!feeTier || !(feeTier in FEE_TIERS)) {
        throw new Error(
          `Invalid feeTier. Available options: ${Object.keys(FEE_TIERS).join(
            ", ",
          )}`,
        );
      }

      const txId = await this.solanaKit.orcaCreateSingleSidedLiquidityPool(
        depositTokenAmount,
        depositTokenMint,
        otherTokenMint,
        initialPrice,
        maxPrice,
        feeTier,
      );

      return JSON.stringify({
        status: "success",
        message: "Single-sided Whirlpool created successfully",
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

export class SolanaOrcaOpenCenteredPosition extends Tool {
  name = "orca_open_centered_position_with_liquidity";
  description = `Add liquidity to a CLMM by opening a centered position in an Orca Whirlpool, the most efficient liquidity pool on Solana.

  Inputs (JSON string):
  - whirlpoolAddress: string, address of the Orca Whirlpool (required).
  - priceOffsetBps: number, bps offset (one side) from the current pool price, e.g., 500 for 5% (required).
  - inputTokenMint: string, mint address of the deposit token (required).
  - inputAmount: number, amount of the deposit token, e.g., 100.0 (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const whirlpoolAddress = new PublicKey(inputFormat.whirlpoolAddress);
      const priceOffsetBps = parseInt(inputFormat.priceOffsetBps, 10);
      const inputTokenMint = new PublicKey(inputFormat.inputTokenMint);
      const inputAmount = new Decimal(inputFormat.inputAmount);

      if (priceOffsetBps < 0) {
        throw new Error(
          "Invalid distanceFromCurrentPriceBps. It must be equal or greater than 0.",
        );
      }

      const txId = await this.solanaKit.orcaOpenCenteredPositionWithLiquidity(
        whirlpoolAddress,
        priceOffsetBps,
        inputTokenMint,
        inputAmount,
      );

      return JSON.stringify({
        status: "success",
        message: "Centered liquidity position opened successfully.",
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

export class SolanaOrcaOpenSingleSidedPosition extends Tool {
  name = "orca_open_single_sided_position";
  description = `Add liquidity to a CLMM by opening a single-sided position in an Orca Whirlpool, the most efficient liquidity pool on Solana.

  Inputs (JSON string):
  - whirlpoolAddress: string, address of the Orca Whirlpool (required).
  - distanceFromCurrentPriceBps: number, distance in basis points from the current price for the position (required).
  - widthBps: number, width of the position in basis points (required).
  - inputTokenMint: string, mint address of the deposit token (required).
  - inputAmount: number, amount of the deposit token, e.g., 100.0 (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const whirlpoolAddress = new PublicKey(inputFormat.whirlpoolAddress);
      const distanceFromCurrentPriceBps =
        inputFormat.distanceFromCurrentPriceBps;
      const widthBps = inputFormat.widthBps;
      const inputTokenMint = new PublicKey(inputFormat.inputTokenMint);
      const inputAmount = new Decimal(inputFormat.inputAmount);

      if (distanceFromCurrentPriceBps < 0 || widthBps < 0) {
        throw new Error(
          "Invalid distanceFromCurrentPriceBps or width. It must be equal or greater than 0.",
        );
      }

      const txId = await this.solanaKit.orcaOpenSingleSidedPosition(
        whirlpoolAddress,
        distanceFromCurrentPriceBps,
        widthBps,
        inputTokenMint,
        inputAmount,
      );

      return JSON.stringify({
        status: "success",
        message: "Single-sided liquidity position opened successfully.",
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
