import { Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

export const keypair = Keypair.generate();

console.log(keypair.publicKey.toString());
console.log(bs58.encode(keypair.secretKey));


export class Wallet {
  private _signer: Keypair;

  constructor(signer: Keypair) {
    this._signer = signer;
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (tx instanceof Transaction) {
      tx.sign(this._signer);
    } else if (tx instanceof VersionedTransaction) {
      tx.sign([this._signer]);
    } else {
      throw new Error("Unsupported transaction type");
    }
    return tx;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    return Promise.all(txs.map((tx) => this.signTransaction(tx)));
  }

  get publicKey(): PublicKey {
    return this._signer.publicKey;
  }
}