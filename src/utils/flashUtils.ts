import { HermesClient } from "@pythnetwork/hermes-client";
import { OraclePrice } from "flash-sdk";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import {
  PoolConfig,
  Token,
  Referral,
  PerpetualsClient,
  Privilege,
} from "flash-sdk";
import { Cluster, PublicKey, Connection, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { SolanaAgentKit } from "../index";

const POOL_NAMES = [
  "Crypto.1",
  "Virtual.1",
  "Governance.1",
  "Community.1",
  "Community.2",
  "Community.3",
];

const DEFAULT_CLUSTER: Cluster = "mainnet-beta";
export const POOL_CONFIGS = POOL_NAMES.map((f) =>
  PoolConfig.fromIdsByName(f, DEFAULT_CLUSTER),
);

const DUPLICATE_TOKENS = POOL_CONFIGS.map((f) => f.tokens).flat();
const tokenMap = new Map();
for (const token of DUPLICATE_TOKENS) {
  tokenMap.set(token.symbol, token);
}
export const ALL_TOKENS: Token[] = Array.from(tokenMap.values());
export const ALL_CUSTODIES = POOL_CONFIGS.map((f) => f.custodies).flat();
const PROGRAM_ID = POOL_CONFIGS[0].programId;

// CU for trade instructions
export const OPEN_POSITION_CU = 150_000;
export const CLOSE_POSITION_CU = 180_000;

const HERMES_URL = "https://hermes.pyth.network"; // Replace with the actual Hermes URL if different

// Create a map of symbol to Pyth price ID
const PRICE_FEED_IDS = ALL_TOKENS.reduce(
  (acc, token) => {
    acc[token.symbol] = token.pythPriceId;
    return acc;
  },
  {} as { [key: string]: string },
);

const hermesClient = new HermesClient(HERMES_URL, {});

export interface PythPriceEntry {
  price: OraclePrice;
  emaPrice: OraclePrice;
  isStale: boolean;
  status: PriceStatus;
}

export enum PriceStatus {
  Trading,
  Unknown,
  Halted,
  Auction,
}

export const fetchOraclePrice = async (
  symbol: string,
): Promise<PythPriceEntry> => {
  const priceFeedId = PRICE_FEED_IDS[symbol];
  if (!priceFeedId) {
    throw new Error(`Price feed ID not found for symbol: ${symbol}`);
  }

  try {
    const hermesPriceFeed = await hermesClient.getPriceFeeds({
      query: symbol,
      filter: "crypto",
    });

    if (!hermesPriceFeed || hermesPriceFeed.length === 0) {
      throw new Error(`No price feed received for ${symbol}`);
    }

    const hemrmesPriceUdpate = await hermesClient.getLatestPriceUpdates(
      [priceFeedId],
      {
        encoding: "hex",
        parsed: true,
      },
    );

    if (!hemrmesPriceUdpate.parsed) {
      throw new Error(`No price feed received for ${symbol}`);
    }
    const hermesEma = hemrmesPriceUdpate.parsed[0].ema_price;
    const hermesPrice = hemrmesPriceUdpate.parsed[0].price;

    const hermesPriceOracle = new OraclePrice({
      price: new BN(hermesPrice.price),
      exponent: new BN(hermesPrice.expo),
      confidence: new BN(hermesPrice.conf),
      timestamp: new BN(hermesPrice.publish_time),
    });

    const hermesEmaOracle = new OraclePrice({
      price: new BN(hermesEma.price),
      exponent: new BN(hermesEma.expo),
      confidence: new BN(hermesEma.conf),
      timestamp: new BN(hermesEma.publish_time),
    });

    const token = ALL_TOKENS.find((t) => t.pythPriceId === priceFeedId);
    if (!token) {
      throw new Error(`Token not found for price feed ID: ${priceFeedId}`);
    }

    const status = !token.isVirtual ? PriceStatus.Trading : PriceStatus.Unknown;

    const pythPriceEntry: PythPriceEntry = {
      price: hermesPriceOracle,
      emaPrice: hermesEmaOracle,
      isStale: false,
      status: status,
    };

    return pythPriceEntry;
  } catch (error) {
    console.error(`Error in fetchOraclePrice for ${symbol}:`, error);
    throw error;
  }
};

export interface MarketInfo {
  [key: string]: {
    tokenPair: string;
    token: string;
    side: string;
    pool: string;
  };
}

const marketSdkInfo: MarketInfo = {};

// Loop through POOL_CONFIGS to process each market
POOL_CONFIGS.forEach((poolConfig) => {
  poolConfig.markets.forEach((market) => {
    const targetToken = ALL_TOKENS.find(
      (token) => token.mintKey.toString() === market.targetMint.toString(),
    );

    // Find collateral token by matching mintKey
    const collateralToken = ALL_TOKENS.find(
      (token) => token.mintKey.toString() === market.collateralMint.toString(),
    );

    if (targetToken?.symbol && collateralToken?.symbol) {
      marketSdkInfo[market.marketAccount.toString()] = {
        tokenPair: `${targetToken.symbol}/${collateralToken.symbol}`,
        token: targetToken.symbol,
        side: Object.keys(market.side)[0],
        pool: poolConfig.poolName,
      };
    }
  });
});

export { marketSdkInfo };

export interface MarketTokenSides {
  [token: string]: {
    long?: { marketID: string };
    short?: { marketID: string };
  };
}

const marketTokenMap: MarketTokenSides = {};

// Convert marketSdkInfo into marketTokenMap
Object.entries(marketSdkInfo).forEach(([marketID, info]) => {
  if (!marketTokenMap[info.token]) {
    marketTokenMap[info.token] = {};
  }

  marketTokenMap[info.token][info.side.toLowerCase() as "long" | "short"] = {
    marketID,
  };
});

export { marketTokenMap };

interface TradingAccountResult {
  nftReferralAccountPK: PublicKey | null;
  nftTradingAccountPk: PublicKey | null;
  nftOwnerRebateTokenAccountPk: PublicKey | null;
}

export async function getNftTradingAccountInfo(
  userPublicKey: PublicKey,
  perpClient: PerpetualsClient,
  poolConfig: PoolConfig,
  collateralCustodySymbol: string,
): Promise<TradingAccountResult> {
  const getNFTReferralAccountPK = (publicKey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("referral"), publicKey.toBuffer()],
      PROGRAM_ID,
    )[0];
  };
  const nftReferralAccountPK = getNFTReferralAccountPK(userPublicKey);
  const nftReferralAccountInfo =
    await perpClient.provider.connection.getAccountInfo(nftReferralAccountPK);

  let nftTradingAccountPk: PublicKey | null = null;
  let nftOwnerRebateTokenAccountPk: PublicKey | null = null;

  if (nftReferralAccountInfo) {
    const nftReferralAccountData = perpClient.program.coder.accounts.decode(
      "referral",
      nftReferralAccountInfo.data,
    ) as Referral;

    nftTradingAccountPk = nftReferralAccountData.refererTradingAccount;

    if (nftTradingAccountPk) {
      const nftTradingAccountInfo =
        await perpClient.provider.connection.getAccountInfo(
          nftTradingAccountPk,
        );
      if (nftTradingAccountInfo) {
        const nftTradingAccount = perpClient.program.coder.accounts.decode(
          "trading",
          nftTradingAccountInfo.data,
        ) as { owner: PublicKey };

        nftOwnerRebateTokenAccountPk = getAssociatedTokenAddressSync(
          poolConfig.getTokenFromSymbol(collateralCustodySymbol).mintKey,
          nftTradingAccount.owner,
        );
        // Check if the account exists
        const accountExists =
          await perpClient.provider.connection.getAccountInfo(
            nftOwnerRebateTokenAccountPk,
          );
        if (!accountExists) {
          console.error(
            "NFT owner rebate token account does not exist and may need to be created",
          );
        }
      }
    }
  }

  return {
    nftReferralAccountPK,
    nftTradingAccountPk,
    nftOwnerRebateTokenAccountPk,
  };
}

/**
 * Creates a new PerpetualsClient instance with the given connection and wallet
 * @param connection Solana connection
 * @param wallet Solana wallet
 * @returns PerpetualsClient instance
 */
export function createPerpClient(
  connection: Connection,
  wallet: Keypair,
): PerpetualsClient {
  const provider = new AnchorProvider(connection, new Wallet(wallet), {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
    skipPreflight: true,
  });

  return new PerpetualsClient(
    provider,
    POOL_CONFIGS[0].programId,
    POOL_CONFIGS[0].perpComposibilityProgramId,
    POOL_CONFIGS[0].fbNftRewardProgramId,
    POOL_CONFIGS[0].rewardDistributionProgram.programId,
    {},
  );
}

export function get_flash_privilege(agent: SolanaAgentKit): Privilege {
  const FLASH_PRIVILEGE = agent.config.FLASH_PRIVILEGE || "None";

  switch (FLASH_PRIVILEGE.toLowerCase()) {
    case "referral":
      return Privilege.Referral;
    case "nft":
      return Privilege.NFT;
    default:
      return Privilege.None;
  }
}
