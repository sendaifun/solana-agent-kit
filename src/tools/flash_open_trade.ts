import { ComputeBudgetProgram } from "@solana/web3.js";
import {
  PerpetualsClient,
  OraclePrice,
  PoolConfig,
  Privilege,
  Side,
  CustodyAccount,
  Custody,
} from "flash-sdk";
import { BN } from "@coral-xyz/anchor";
import { SolanaAgentKit } from "../index";
import {
  ALL_TOKENS,
  marketSdkInfo,
  marketTokenMap,
  getNftTradingAccountInfo,
  OPEN_POSITION_CU,
  fetchOraclePrice,
  createPerpClient,
} from "../utils/flashUtils";
import { FlashTradeParams } from "../types";

/**
 * Opens a new position on Flash.Trade
 * @param agent SolanaAgentKit instance
 * @param params Trade parameters
 * @returns Transaction signature
 */
export async function flashOpenTrade(
  agent: SolanaAgentKit,
  params: FlashTradeParams,
): Promise<string> {
  try {
    const { token, side, collateralUsd, leverage } = params;

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
    const targetToken = ALL_TOKENS.find((t) => t.symbol === targetSymbol);
    const collateralToken = ALL_TOKENS.find(
      (t) => t.symbol === collateralSymbol,
    );

    if (!targetToken || !collateralToken) {
      throw new Error(`Token not found for pair ${marketData.tokenPair}`);
    }

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

    // Calculate position parameters
    const leverageBN = new BN(leverage);
    const collateralTokenPrice = convertPriceToNumber(collateralPrice.price);
    const collateralAmount = calculateCollateralAmount(
      collateralUsd,
      collateralTokenPrice,
      collateralToken.decimals,
    );

    // Get custody accounts
    const { targetCustody, collateralCustody } = await fetchCustodyAccounts(
      perpClient,
      poolConfig,
      targetSymbol,
      collateralSymbol,
    );

    // Calculate position size
    const positionSize = calculatePositionSize(
      perpClient,
      collateralAmount,
      leverageBN,
      targetToken,
      collateralToken,
      side,
      targetPrice.price,
      collateralPrice.price,
      targetCustody,
      collateralCustody,
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
      !tradingAccounts.nftReferralAccountPK
    ) {
      throw new Error("Required NFT trading accounts not found");
    }

    // Prepare transaction
    const slippageBps = new BN(1000);
    const priceWithSlippage = perpClient.getPriceAfterSlippage(
      true,
      slippageBps,
      targetPrice.price,
      side === "long" ? Side.Long : Side.Short,
    );

    // Build and send transaction
    const { instructions, additionalSigners } = await perpClient.openPosition(
      targetSymbol,
      collateralSymbol,
      priceWithSlippage,
      collateralAmount,
      positionSize,
      side === "long" ? Side.Long : Side.Short,
      poolConfig,
      Privilege.Referral,
      tradingAccounts.nftTradingAccountPk,
      tradingAccounts.nftReferralAccountPK,
      tradingAccounts.nftOwnerRebateTokenAccountPk!,
      false,
    );

    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: OPEN_POSITION_CU,
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
    throw new Error(`Flash trade failed: ${error}`);
  }
}

// Helper functions
function convertPriceToNumber(oraclePrice: OraclePrice): number {
  const price = parseInt(oraclePrice.price.toString("hex"), 16);
  const exponent = parseInt(oraclePrice.exponent.toString("hex"), 16);
  return price * Math.pow(10, exponent);
}

function calculateCollateralAmount(
  usdAmount: number,
  tokenPrice: number,
  decimals: number,
): BN {
  return new BN((usdAmount / tokenPrice) * Math.pow(10, decimals));
}

async function fetchCustodyAccounts(
  perpClient: PerpetualsClient,
  poolConfig: PoolConfig,
  targetSymbol: string,
  collateralSymbol: string,
) {
  const targetConfig = poolConfig.custodies.find(
    (c) => c.symbol === targetSymbol,
  );
  const collateralConfig = poolConfig.custodies.find(
    (c) => c.symbol === collateralSymbol,
  );

  if (!targetConfig || !collateralConfig) {
    throw new Error("Custody configuration not found");
  }

  const accounts = await perpClient.provider.connection.getMultipleAccountsInfo(
    [targetConfig.custodyAccount, collateralConfig.custodyAccount],
  );

  if (!accounts[0] || !accounts[1]) {
    throw new Error("Failed to fetch custody accounts");
  }

  return {
    targetCustody: CustodyAccount.from(
      targetConfig.custodyAccount,
      perpClient.program.coder.accounts.decode<Custody>(
        "custody",
        accounts[0].data,
      ),
    ),
    collateralCustody: CustodyAccount.from(
      collateralConfig.custodyAccount,
      perpClient.program.coder.accounts.decode<Custody>(
        "custody",
        accounts[1].data,
      ),
    ),
  };
}

function calculatePositionSize(
  perpClient: PerpetualsClient,
  collateralAmount: BN,
  leverage: BN,
  targetToken: any,
  collateralToken: any,
  side: "long" | "short",
  targetPrice: OraclePrice,
  collateralPrice: OraclePrice,
  targetCustody: CustodyAccount,
  collateralCustody: CustodyAccount,
): BN {
  return perpClient.getSizeAmountFromLeverageAndCollateral(
    collateralAmount,
    leverage.toString(),
    targetToken,
    collateralToken,
    side === "long" ? Side.Long : Side.Short,
    targetPrice,
    targetPrice,
    targetCustody,
    collateralPrice,
    collateralPrice,
    collateralCustody,
  );
}
