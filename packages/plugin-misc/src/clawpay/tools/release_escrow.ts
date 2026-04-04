import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { ClawPayEscrowResponse } from "../types";

const CLAWPAY_PROGRAM_ID = new PublicKey(
  "F2nwkN9i2kUDgjfLwHwz2zPBXDxLDFjzmnV4TXT6BWeD",
);

/**
 * Release funds from a ClawPay escrow to the seller after delivery is verified
 * @param agent SolanaAgentKit instance (must be the buyer)
 * @param escrowAddress The escrow account public key
 * @param seller The seller's public key to receive funds
 * @returns Object containing the transaction signature
 */
export async function releaseClawPayEscrow(
  agent: SolanaAgentKit,
  escrowAddress: PublicKey,
  seller: PublicKey,
): Promise<ClawPayEscrowResponse> {
  try {
    const buyer = agent.wallet.publicKey;

    // Anchor discriminator for "release_funds"
    const discriminator = Buffer.from([
      0xc2, 0xd7, 0x94, 0xb2, 0x1e, 0x6c, 0x9a, 0x48,
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: buyer, isSigner: true, isWritable: true },
        { pubkey: seller, isSigner: false, isWritable: true },
        { pubkey: escrowAddress, isSigner: false, isWritable: true },
      ],
      programId: CLAWPAY_PROGRAM_ID,
      data: discriminator,
    });

    const tx = new Transaction().add(instruction);
    tx.feePayer = buyer;
    tx.recentBlockhash = (
      await agent.connection.getLatestBlockhash()
    ).blockhash;

    const signedTx = await agent.wallet.signTransaction(tx);
    const signature = await agent.connection.sendRawTransaction(
      signedTx.serialize(),
      {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      },
    );

    const latestBlockhash = await agent.connection.getLatestBlockhash();
    await agent.connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return {
      status: "success",
      escrowAddress: escrowAddress.toBase58(),
      signature,
    };
  } catch (err: any) {
    throw new Error(`Failed to release escrow: ${err.message}`);
  }
}
