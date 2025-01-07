import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { WalletAdapter } from "./EmbedWallet";

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

  connectWallet(wallet: WalletAdapter): void {
    this.currentWallet = wallet;
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
      payer: adapter as any,
    };
  }
}

export const walletManager = WalletManager.getInstance();
