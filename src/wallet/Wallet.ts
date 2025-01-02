import { Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import bs58 from "bs58";

export interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
}

class KeypairWallet implements WalletAdapter {
  constructor(private keypair: Keypair) {}

  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (transaction instanceof Transaction) {
      transaction.partialSign(this.keypair);
    }
    return transaction;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    return transactions.map((tx) => {
      if (tx instanceof Transaction) {
        tx.partialSign(this.keypair);
      }
      return tx;
    });
  }
}

export class WalletManager {
  private static instance: WalletManager;
  private currentWallet: WalletAdapter | null = null;

  private constructor() {}

  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  connectWallet(walletOrPrivateKeyOrKeypair: WalletAdapter | string | Keypair, keypair: Keypair): void {
    if (typeof walletOrPrivateKeyOrKeypair === 'string') {
      const keypair = Keypair.fromSecretKey(bs58.decode(walletOrPrivateKeyOrKeypair));
      this.currentWallet = new KeypairWallet(keypair);
    } else if (walletOrPrivateKeyOrKeypair instanceof Keypair) {
      this.currentWallet = new KeypairWallet(walletOrPrivateKeyOrKeypair);
    } else {
      this.currentWallet = walletOrPrivateKeyOrKeypair;
    }
  }

  getWallet(): WalletAdapter {
    if (!this.currentWallet) {
      throw new Error("No wallet connected. Please connect a wallet first.");
    }
    return this.currentWallet;
  }

  disconnectWallet(): void {
    this.currentWallet = null;
  }

  isConnected(): boolean {
    return this.currentWallet !== null;
  }

  getAnchorWallet(): Wallet {
    const adapter = this.getWallet();
    return {
      publicKey: adapter.publicKey,
      signTransaction: adapter.signTransaction.bind(adapter),
      signAllTransactions: adapter.signAllTransactions.bind(adapter),
      payer: adapter as any, // Add this line to satisfy the NodeWallet type
    };
  }
}

export const walletManager = WalletManager.getInstance();

