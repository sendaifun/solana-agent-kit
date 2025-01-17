import {
  BASE_PRECISION,
  convertToNumber,
  DRIFT_PROGRAM_ID,
  DriftClient,
  FastSingleTxSender,
  getLimitOrderParams,
  getMarketOrderParams,
  getUserAccountPublicKeySync,
  MainnetSpotMarkets,
  numberToSafeBN,
  PositionDirection,
  PostOnlyParams,
  PRICE_PRECISION,
  QUOTE_PRECISION,
  User,
  type IWallet,
} from "@drift-labs/sdk";
import type { SolanaAgentKit } from "../../agent";
import * as anchor from "@coral-xyz/anchor";
import { IDL, VAULT_PROGRAM_ID, VaultClient } from "@drift-labs/vaults-sdk";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { ComputeBudgetProgram } from "@solana/web3.js";

export async function initClients(
  agent: SolanaAgentKit,
  params?: {
    authority: PublicKey;
    activeSubAccountId: number;
    subAccountIds: number[];
  },
) {
  const wallet: IWallet = {
    publicKey: agent.wallet.publicKey,
    payer: agent.wallet,
    signAllTransactions: async (txs) => {
      for (const tx of txs) {
        tx.sign(agent.wallet);
      }
      return txs;
    },
    signTransaction: async (tx) => {
      tx.sign(agent.wallet);
      return tx;
    },
  };

  // @ts-expect-error - false undefined type conflict
  const driftClient = new DriftClient({
    connection: agent.connection,
    wallet,
    env: "mainnet-beta",
    authority: params?.authority,
    activeSubAccountId: params?.activeSubAccountId,
    subAccountIds: params?.subAccountIds,
    txParams: {
      computeUnitsPrice: 0.000001 * 1000000 * 1000000,
    },
    txSender: new FastSingleTxSender({
      connection: agent.connection,
      wallet,
      timeout: 30000,
      blockhashRefreshInterval: 1000,
      opts: {
        commitment: agent.connection.commitment ?? "confirmed",
        skipPreflight: false,
        preflightCommitment: agent.connection.commitment ?? "confirmed",
      },
    }),
  });
  const vaultProgram = new anchor.Program(
    IDL,
    VAULT_PROGRAM_ID,
    driftClient.provider,
  );
  const vaultClient = new VaultClient({
    driftClient,
    // @ts-expect-error - type mismatch due to different dep versions
    program: vaultProgram,
    cliMode: false,
  });
  await driftClient.subscribe();

  async function cleanUp() {
    await driftClient.unsubscribe();
  }

  return { driftClient, vaultClient, cleanUp };
}

/**
 * Create a drift user account provided an amount
 * @param amount amount of the token to deposit
 * @param symbol symbol of the token to deposit
 */
export async function createDriftUserAccount(
  agent: SolanaAgentKit,
  amount: number,
  symbol: string,
) {
  try {
    const { driftClient, cleanUp } = await initClients(agent);
    const user = new User({
      driftClient,
      userAccountPublicKey: getUserAccountPublicKeySync(
        new PublicKey(DRIFT_PROGRAM_ID),
        agent.wallet.publicKey,
      ),
    });
    const userAccountExists = await user.exists();
    const token = MainnetSpotMarkets.find(
      (v) => v.symbol === symbol.toUpperCase(),
    );

    if (!token) {
      throw new Error(`Token with symbol ${symbol} not found`);
    }

    if (!userAccountExists) {
      const depositAmount = numberToSafeBN(amount, token.precision);
      const [txSignature, account] =
        await driftClient.initializeUserAccountAndDepositCollateral(
          depositAmount,
          getAssociatedTokenAddressSync(token.mint, agent.wallet.publicKey),
        );

      await cleanUp();
      return { txSignature, account };
    }

    await cleanUp();
    return {
      message: "User account already exists",
      account: user.userAccountPublicKey,
    };
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to create user account: ${e.message}`);
  }
}

/**
 * Deposit to your drift user account
 * @param agent
 * @param amount
 * @param symbol
 * @param isRepay
 * @returns
 */
export async function depositToDriftUserAccount(
  agent: SolanaAgentKit,
  amount: number,
  symbol: string,
  isRepay = false,
) {
  try {
    const { driftClient, cleanUp } = await initClients(agent);
    const publicKey = agent.wallet.publicKey;
    const user = new User({
      driftClient,
      userAccountPublicKey: getUserAccountPublicKeySync(
        new PublicKey(DRIFT_PROGRAM_ID),
        publicKey,
      ),
    });
    const userAccountExists = await user.exists();
    const token = MainnetSpotMarkets.find(
      (v) => v.symbol === symbol.toUpperCase(),
    );

    if (!token) {
      throw new Error(`Token with symbol ${symbol} not found`);
    }

    if (!userAccountExists) {
      throw new Error("You need to create a Drift user account first.");
    }

    const depositAmount = numberToSafeBN(amount, token.precision);

    const [depInstruction, latestBlockhash] = await Promise.all([
      driftClient.getDepositTxnIx(
        depositAmount,
        token.marketIndex,
        getAssociatedTokenAddressSync(token.mint, publicKey),
        undefined,
        isRepay,
      ),
      driftClient.connection.getLatestBlockhash(),
    ]);

    const tx = new Transaction().add(...depInstruction).add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 0.000001 * 1000000 * 1000000,
      }),
    );
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(agent.wallet);
    const txSignature = await driftClient.txSender.sendRawTransaction(
      tx.serialize(),
      { ...driftClient.opts },
    );

    await cleanUp();
    return txSignature;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to deposit to user account: ${e.message}`);
  }
}

export async function withdrawFromDriftUserAccount(
  agent: SolanaAgentKit,
  amount: number,
  symbol: string,
  isBorrow = false,
) {
  try {
    const { driftClient, cleanUp } = await initClients(agent);
    const user = new User({
      driftClient,
      userAccountPublicKey: getUserAccountPublicKeySync(
        new PublicKey(DRIFT_PROGRAM_ID),
        agent.wallet.publicKey,
      ),
    });
    const userAccountExists = await user.exists();

    if (!userAccountExists) {
      throw new Error("You need to create a Drift user account first.");
    }

    const token = MainnetSpotMarkets.find(
      (v) => v.symbol === symbol.toUpperCase(),
    );

    if (!token) {
      throw new Error(`Token with symbol ${symbol} not found`);
    }

    const withdrawAmount = numberToSafeBN(amount, token.precision);

    const [withdrawInstruction, latestBlockhash] = await Promise.all([
      driftClient.getWithdrawalIxs(
        withdrawAmount,
        token.marketIndex,
        getAssociatedTokenAddressSync(token.mint, agent.wallet.publicKey),
        !isBorrow,
      ),
      driftClient.connection.getLatestBlockhash(),
    ]);

    const tx = new Transaction().add(...withdrawInstruction).add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 0.000001 * 1000000 * 1000000,
      }),
    );
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.sign(agent.wallet);

    const txSignature = await driftClient.txSender.sendRawTransaction(
      tx.serialize(),
      { ...driftClient.opts },
    );

    await cleanUp();
    return txSignature;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to withdraw from user account: ${e.message}`);
  }
}

/**
 * Open a perpetual trade on drift
 * @param agent
 * @param params.amount
 * @param params.symbol
 * @param params.action
 * @param params.type
 * @param params.price this should only be supplied if type is limit
 * @param params.reduceOnly
 */
export async function driftPerpTrade(
  agent: SolanaAgentKit,
  params: {
    amount: number;
    symbol: string;
    action: "long" | "short";
    type: "market" | "limit";
    price?: number | undefined;
  },
) {
  try {
    const { driftClient, cleanUp } = await initClients(agent);
    const user = new User({
      driftClient,
      userAccountPublicKey: getUserAccountPublicKeySync(
        new PublicKey(DRIFT_PROGRAM_ID),
        agent.wallet.publicKey,
      ),
    });
    const userAccountExists = await user.exists();

    if (!userAccountExists) {
      throw new Error("You need to create a Drift user account first.");
    }

    const market = driftClient.getMarketIndexAndType(
      `${params.symbol.toUpperCase()}-PERP`,
    );

    if (!market) {
      throw new Error(`Token with symbol ${params.symbol} not found`);
    }

    const baseAssetPrice = driftClient.getOracleDataForPerpMarket(
      market.marketIndex,
    );
    const convertedAmount =
      params.amount / convertToNumber(baseAssetPrice.price, PRICE_PRECISION);

    let signature: anchor.web3.TransactionSignature;

    if (params.type === "limit") {
      if (!params.price) {
        throw new Error("Price is required for limit orders");
      }

      signature = await driftClient.placePerpOrder(
        getLimitOrderParams({
          baseAssetAmount: numberToSafeBN(convertedAmount, BASE_PRECISION),
          reduceOnly: false,
          direction:
            params.action === "long"
              ? PositionDirection.LONG
              : PositionDirection.SHORT,
          marketIndex: market.marketIndex,
          price: numberToSafeBN(params.price, PRICE_PRECISION),
          postOnly: PostOnlyParams.SLIDE,
        }),
        {
          computeUnitsPrice: 0.000001 * 1000000 * 1000000,
        },
      );
    } else {
      signature = await driftClient.placePerpOrder(
        getMarketOrderParams({
          baseAssetAmount: numberToSafeBN(convertedAmount, BASE_PRECISION),
          reduceOnly: false,
          direction:
            params.action === "long"
              ? PositionDirection.LONG
              : PositionDirection.SHORT,
          marketIndex: market.marketIndex,
        }),
        {
          computeUnitsPrice: 0.000001 * 1000000 * 1000000,
        },
      );
    }

    if (!signature) {
      throw new Error("Failed to place order. Please make sure ");
    }

    await cleanUp();
    return signature;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to place order: ${e.message}`);
  }
}

/**
 * Check if a user has a drift account
 * @param agent
 */
export async function doesUserHaveDriftAccount(agent: SolanaAgentKit) {
  try {
    const { driftClient, cleanUp } = await initClients(agent);
    const user = new User({
      driftClient,
      userAccountPublicKey: getUserAccountPublicKeySync(
        new PublicKey(DRIFT_PROGRAM_ID),
        agent.wallet.publicKey,
      ),
    });
    user.getActivePerpPositions();
    const userAccountExists = await user.exists();
    await cleanUp();
    return {
      hasAccount: userAccountExists,
      account: user.userAccountPublicKey,
    };
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to check user account: ${e.message}`);
  }
}

/**
 * Get account info for a drift User
 * @param agent
 * @returns
 */
export async function driftUserAccountInfo(agent: SolanaAgentKit) {
  try {
    const { driftClient, cleanUp } = await initClients(agent);
    const user = new User({
      driftClient,
      userAccountPublicKey: getUserAccountPublicKeySync(
        new PublicKey(DRIFT_PROGRAM_ID),
        agent.wallet.publicKey,
      ),
    });
    const userAccountExists = await user.exists();

    if (!userAccountExists) {
      throw new Error("User account does not exist");
    }
    await user.subscribe();
    const account = user.getUserAccount();
    await user.unsubscribe();

    await cleanUp();
    const perpPositions = account.perpPositions.map((pos) => ({
      ...pos,
      baseAssetAmount: convertToNumber(pos.baseAssetAmount, BASE_PRECISION),
      settledPnl: convertToNumber(pos.settledPnl, QUOTE_PRECISION),
    }));
    const spotPositions = account.spotPositions.map((pos) => ({
      ...pos,
      scaledBalance: convertToNumber(pos.scaledBalance, BASE_PRECISION),
      cumulativeDeposits: convertToNumber(
        pos.cumulativeDeposits,
        BASE_PRECISION,
      ),
      symbol: MainnetSpotMarkets.find((v) => v.marketIndex === pos.marketIndex)
        ?.symbol,
    }));

    return {
      ...account,
      name: account.name,
      authority: account.authority,
      totalDeposits: `$${convertToNumber(account.totalDeposits, QUOTE_PRECISION)}`,
      totalWithdraws: `$${convertToNumber(account.totalWithdraws, QUOTE_PRECISION)}`,
      settledPerpPnl: `$${convertToNumber(account.settledPerpPnl, QUOTE_PRECISION)}`,
      lastActiveSlot: account.lastActiveSlot.toNumber(),
      perpPositions,
      spotPositions,
    };
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to check user account: ${e.message}`);
  }
}
