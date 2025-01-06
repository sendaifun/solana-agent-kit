import { PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import {
  PerpetualsClient,
  OraclePrice,
  PoolConfig,
  Privilege,
  Side,
} from "flash-sdk";
import { BN } from "@coral-xyz/anchor";
import { SolanaAgentKit } from "../index";
import {
  CLOSE_POSITION_CU,
  marketSdkInfo,
  marketTokenMap,
  getNftTradingAccountInfo,
  fetchOraclePrice,
  createPerpClient,
} from "../utils/flashUtils";
import { FlashCloseTradeParams } from "../types";

/**
 * Closes an existing position on Flash.Trade
 * @param agent SolanaAgentKit instance
 * @param params Trade parameters
 * @returns Transaction signature
 */
export async function flashCloseTrade(
  agent: SolanaAgentKit,
  params: FlashCloseTradeParams,
): Promise<string> {
  try {
    const { token, side } = params;

    // Get market ID from token and side using marketTokenMap
    const tokenMarkets = marketTokenMap[token];
    if (!tokenMarkets) {
      throw new Error(`Token ${token} not supported for trading`);
    }

    const sideEntry = tokenMarkets[side];
    if (!sideEntry) {
      throw new Error(`${side} side not available for ${token}`);
    }

    const market = sideEntry.marketID;

    // Validate market data using marketSdkInfo
    const marketData = marketSdkInfo[market];
    if (!marketData) {
      throw new Error(`Invalid market configuration for ${token}/${side}`);
    }

    // Get token information
    const [targetSymbol, collateralSymbol] = marketData.tokenPair.split("/");

    // Fetch oracle prices
    const [targetPrice, collateralPrice] = await Promise.all([
      fetchOraclePrice(targetSymbol),
      fetchOraclePrice(collateralSymbol),
    ]);

    // Initialize pool configuration and perpClient
    const poolConfig = PoolConfig.fromIdsByName(
      marketData.pool,
      "mainnet-beta",
    );
    const perpClient = createPerpClient(agent.connection, agent.wallet);

    // Calculate price after slippage
    const slippageBpsBN = new BN(100); // 1% slippage
    const sideEnum = side === "long" ? Side.Long : Side.Short;
    const priceWithSlippage = perpClient.getPriceAfterSlippage(
      false, // isEntry = false for closing position
      slippageBpsBN,
      targetPrice.price,
      sideEnum,
    );

    // Get NFT trading account info
    const tradingAccounts = await getNftTradingAccountInfo(
      agent.wallet_address,
      perpClient,
      poolConfig,
      collateralSymbol,
    );

    if (
      !tradingAccounts.nftTradingAccountPk ||
      !tradingAccounts.nftReferralAccountPK ||
      !tradingAccounts.nftOwnerRebateTokenAccountPk
    ) {
      throw new Error("Required NFT trading accounts not found");
    }

    // Build and send transaction
    const { instructions, additionalSigners } = await perpClient.closePosition(
      targetSymbol,
      collateralSymbol,
      priceWithSlippage,
      sideEnum,
      poolConfig,
      Privilege.Referral,
      tradingAccounts.nftTradingAccountPk,
      tradingAccounts.nftReferralAccountPK,
      tradingAccounts.nftOwnerRebateTokenAccountPk,
    );

    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: CLOSE_POSITION_CU,
    });

    return await perpClient.sendTransaction(
      [computeBudgetIx, ...instructions],
      {
        additionalSigners: additionalSigners,
        alts: perpClient.addressLookupTables,
        prioritizationFee: 5000000,
      },
    );
  } catch (error) {
    throw new Error(`Flash trade close failed: ${error}`);
  }
}
