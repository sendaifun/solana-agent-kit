import {
  type ConfirmOptions,
  Connection,
  type Keypair,
  PublicKey,
  SendOptions,
  type Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import type { BaseWallet } from "../types/wallet";

/**
 * Check if a transaction object is a VersionedTransaction or not
 *
 * @param tx
 * @returns bool
 */
export const isVersionedTransaction = (
  tx: Transaction | VersionedTransaction,
): tx is VersionedTransaction => {
  return "version" in tx;
};

/**
 * A wallet implementation using a Keypair for signing transactions
 */
export class KeypairWallet implements BaseWallet {
  publicKey: PublicKey;
  private payer: Keypair;
  rpcUrl: string;

  /**
   * Constructs a KeypairWallet with a given Keypair
   * @param keypair - The Keypair to use for signing transactions
   */
  constructor(keypair: Keypair, rpcUrl: string) {
    this.publicKey = keypair.publicKey;
    this.payer = keypair;
    this.rpcUrl = rpcUrl;
  }

  defaultOptions: ConfirmOptions = {
    preflightCommitment: "processed",
    commitment: "processed",
  };

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
  ): Promise<T> {
    if (isVersionedTransaction(transaction)) {
      transaction.sign([this.payer]);
    } else {
      transaction.partialSign(this.payer);
    }

    return transaction;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[],
  ): Promise<T[]> {
    return txs.map((t) => {
      if (isVersionedTransaction(t)) {
        t.sign([this.payer]);
      } else {
        t.partialSign(this.payer);
      }
      return t;
    });
  }

  async sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
  ): Promise<string> {
    const connection = new Connection(this.rpcUrl);

    if (transaction instanceof VersionedTransaction) {
      transaction.sign([this.payer]);
    } else {
      transaction.partialSign(this.payer);
    }

    return await connection.sendRawTransaction(transaction.serialize());
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const signature = nacl.sign.detached(message, this.payer.secretKey);
    return signature;
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions,
  ): Promise<{ signature: TransactionSignature }> {
    const connection = new Connection(this.rpcUrl);
    if (transaction instanceof VersionedTransaction) {
      transaction.sign([this.payer]);
    } else {
      transaction.partialSign(this.payer);
    }

    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      options,
    );
    return { signature };
  }
}

/**
 * A mock wallet implementation that cannot sign transactions
 */
export const mockBaseWallet: BaseWallet = {
  publicKey:  PublicKey.default,
  signTransaction: <T extends Transaction | VersionedTransaction>(_tx: T) => mockWalletThrowMessaage(),
  signMessage: (_message: Uint8Array) => mockWalletThrowMessaage(),
  signAllTransactions: <T extends Transaction | VersionedTransaction>(_transactions: T[]) =>
    mockWalletThrowMessaage(),
  signAndSendTransaction: (tx: Transaction | VersionedTransaction) =>
    mockWalletThrowMessaage(),
}


function mockWalletThrowMessaage(): any {
  throw "mockBaseWallet cannot sign transactions"
}
