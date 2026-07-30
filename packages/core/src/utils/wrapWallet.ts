import type {
  PublicKey,
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import type { BaseWallet } from "../types/wallet";

/**
 * Why the wallet was about to sign / send.
 * Covers every BaseWallet path plugins actually use (not only signOrSendTX).
 */
export type BeforeSignMode = "sign" | "signAndSend" | "signAll" | "send";

/**
 * Context for an optional pre-sign policy hook.
 *
 * Hosts may throw / reject to refuse the signature. Core never calls the network
 * on their behalf — policy is pluggable and dependency-free.
 */
export type BeforeSignContext = {
  publicKey: PublicKey;
  transaction: Transaction | VersionedTransaction;
  mode: BeforeSignMode;
};

export type BeforeSign = (
  ctx: BeforeSignContext,
) => void | Promise<void>;

/**
 * Wrap a BaseWallet so every sign / send path runs `beforeSign` first.
 *
 * This is the only complete refuse-before-sign seat in SAK: many plugins call
 * `agent.wallet.signAndSendTransaction` directly and bypass `signOrSendTX`.
 *
 * `signMessage` is intentionally not guarded (not a spend path).
 */
export function wrapWallet(
  wallet: BaseWallet,
  beforeSign: BeforeSign,
): BaseWallet {
  const guard = async (
    transaction: Transaction | VersionedTransaction,
    mode: BeforeSignMode,
  ): Promise<void> => {
    await beforeSign({
      publicKey: wallet.publicKey,
      transaction,
      mode,
    });
  };

  const wrapped: BaseWallet = {
    get publicKey() {
      return wallet.publicKey;
    },

    async signTransaction<T extends Transaction | VersionedTransaction>(
      transaction: T,
    ): Promise<T> {
      await guard(transaction, "sign");
      return wallet.signTransaction(transaction);
    },

    async signAllTransactions<T extends Transaction | VersionedTransaction>(
      transactions: T[],
    ): Promise<T[]> {
      for (const transaction of transactions) {
        await guard(transaction, "signAll");
      }
      return wallet.signAllTransactions(transactions);
    },

    async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
      transaction: T,
      options?: SendOptions,
    ): Promise<{ signature: TransactionSignature }> {
      await guard(transaction, "signAndSend");
      return wallet.signAndSendTransaction(transaction, options);
    },

    signMessage(message: Uint8Array): Promise<Uint8Array> {
      return wallet.signMessage(message);
    },
  };

  if (wallet.sendTransaction) {
    const send = wallet.sendTransaction.bind(wallet);
    wrapped.sendTransaction = async <
      T extends Transaction | VersionedTransaction,
    >(
      transaction: T,
    ): Promise<string> => {
      await guard(transaction, "send");
      return send(transaction);
    };
  }

  return wrapped;
}
