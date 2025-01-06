import { SolanaAgentKit } from "../index";
import { TensorSwapSDK } from "@tensor-oss/tensorswap-sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";

export async function listNFTForSale(
  agent: SolanaAgentKit,
  nftMint: PublicKey,
  price: number,
): Promise<string> {
  try {
    if (!PublicKey.isOnCurve(nftMint)) {
      throw new Error("Invalid NFT mint address");
    }

    const mintInfo = await agent.connection.getAccountInfo(nftMint);
    if (!mintInfo) {
      throw new Error(`NFT mint ${nftMint.toString()} does not exist`);
    }

    const ata = await getAssociatedTokenAddress(nftMint, agent.wallet_address);

    try {
      const tokenAccount = await getAccount(agent.connection, ata);

      if (!tokenAccount || tokenAccount.amount <= 0) {
        throw new Error(`You don't own this NFT (${nftMint.toString()})`);
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(
        `No token account found for mint ${nftMint.toString()}. Make sure you own this NFT.`,
      );
    }

    const provider = new AnchorProvider(
      agent.connection,
      new Wallet(agent.wallet),
      AnchorProvider.defaultOptions(),
    );

    const tensorSwapSdk = new TensorSwapSDK({ provider });
    const priceInLamports = new BN(price * 1e9);
    const nftSource = await getAssociatedTokenAddress(
      nftMint,
      agent.wallet_address,
    );

    const { tx } = await tensorSwapSdk.list({
      nftMint,
      nftSource,
      owner: agent.wallet_address,
      price: priceInLamports,
      tokenProgram: TOKEN_PROGRAM_ID,
      payer: agent.wallet_address,
    });

    const transaction = new Transaction();
    transaction.add(...tx.ixs);
    return await agent.connection.sendTransaction(transaction, [
      agent.wallet,
      ...tx.extraSigners,
    ]);
  } catch (error: any) {
    console.error("Full error details:", error);
    throw error;
  }
}

export async function cancelListing(
  agent: SolanaAgentKit,
  nftMint: PublicKey,
): Promise<string> {
  const provider = new AnchorProvider(
    agent.connection,
    new Wallet(agent.wallet),
    AnchorProvider.defaultOptions(),
  );

  const tensorSwapSdk = new TensorSwapSDK({ provider });
  const nftDest = await getAssociatedTokenAddress(
    nftMint,
    agent.wallet_address,
    false,
    TOKEN_PROGRAM_ID,
  );

  const { tx } = await tensorSwapSdk.delist({
    nftMint,
    nftDest,
    owner: agent.wallet_address,
    tokenProgram: TOKEN_PROGRAM_ID,
    payer: agent.wallet_address,
    authData: null,
  });

  const transaction = new Transaction();
  transaction.add(...tx.ixs);
  return await agent.connection.sendTransaction(transaction, [
    agent.wallet,
    ...tx.extraSigners,
  ]);
}
