import { SolanaAgentKit } from "../../agent";
import { Wallet } from "@coral-xyz/anchor";
import {
  ORCA_WHIRLPOOL_PROGRAM_ID,
  WhirlpoolContext,
  buildWhirlpoolClient,
  getAllPositionAccountsByOwner,
  PriceMath,
} from "@orca-so/whirlpools-sdk";

interface PositionInfo {
  whirlpoolAddress: string;
  positionInRange: boolean;
  distanceFromCenterBps: number;
}

type PositionDataMap = {
  [positionMintAddress: string]: PositionInfo;
};

/**
 * # Fetches Liquidity Position Data in Orca Whirlpools
 *
 * Fetches data for all liquidity positions owned by the provided wallet, including:
 * - Whirlpool address.
 * - Whether the position is in range.
 * - Distance from the center price to the current price in basis points.
 *
 * ## Parameters
 * - `agent`: The `SolanaAgentKit` instance representing the wallet and connection.
 *
 * ## Returns
 * A JSON string with an object mapping position mint addresses to position details:
 * ```json
 * {
 *   "positionMintAddress1": {
 *     "whirlpoolAddress": "whirlpoolAddress1",
 *     "positionInRange": true,
 *     "distanceFromCenterBps": 250
 *   }
 * }
 * ```
 *
 * ## Throws
 * - If positions cannot be fetched or processed.
 * - If the position mint address is invalid.
 *
 * @param agent - The `SolanaAgentKit` instance.
 * @returns A JSON string with position data.
 */
export async function orcaFetchPositions(
  agent: SolanaAgentKit,
): Promise<string> {
  try {
    const wallet = new Wallet(agent.wallet);
    const ctx = WhirlpoolContext.from(
      agent.connection,
      wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID,
    );
    const client = buildWhirlpoolClient(ctx);

    const positions = await getAllPositionAccountsByOwner({
      ctx,
      owner: agent.wallet.publicKey,
    });
    const positionDatas = [
      ...positions.positions.entries(),
      ...positions.positionsWithTokenExtensions.entries(),
    ];
    const result: PositionDataMap = {};
    for (const [, positionData] of positionDatas) {
      const positionMintAddress = positionData.positionMint;
      const whirlpoolAddress = positionData.whirlpool;
      const whirlpool = await client.getPool(whirlpoolAddress);
      const whirlpoolData = whirlpool.getData();
      const sqrtPrice = whirlpoolData.sqrtPrice;
      const currentTick = whirlpoolData.tickCurrentIndex;
      const mintA = whirlpool.getTokenAInfo();
      const mintB = whirlpool.getTokenBInfo();
      const currentPrice = PriceMath.sqrtPriceX64ToPrice(
        sqrtPrice,
        mintA.decimals,
        mintB.decimals,
      );
      const lowerTick = positionData.tickLowerIndex;
      const upperTick = positionData.tickUpperIndex;
      const lowerPrice = PriceMath.tickIndexToPrice(
        lowerTick,
        mintA.decimals,
        mintB.decimals,
      );
      const upperPrice = PriceMath.tickIndexToPrice(
        upperTick,
        mintA.decimals,
        mintB.decimals,
      );
      const centerPosition = lowerPrice.add(upperPrice).div(2);

      const positionInRange =
        currentTick > lowerTick && currentTick < upperTick ? true : false;
      const distanceFromCenterBps = Math.ceil(
        currentPrice
          .sub(centerPosition)
          .abs()
          .div(centerPosition)
          .mul(10000)
          .toNumber(),
      );

      result[positionMintAddress.toString()] = {
        whirlpoolAddress: whirlpoolAddress.toString(),
        positionInRange,
        distanceFromCenterBps,
      };
    }
    return JSON.stringify(result);
  } catch (error) {
    throw new Error(`${error}`);
  }
}
