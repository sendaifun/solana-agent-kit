
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { walletManager } from "../wallet/Wallet";
 

export const keypair = Keypair.generate();
const walletId = keypair.publicKey.toString();
const wallet = walletManager.connectWallet(walletId, keypair);

console.log(keypair.publicKey.toString());
console.log(bs58.encode(keypair.secretKey));

export { wallet };