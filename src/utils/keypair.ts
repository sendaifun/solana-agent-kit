import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export const keypair = Keypair.generate();

console.log(keypair.publicKey.toString());
console.log(bs58.encode(keypair.secretKey));
