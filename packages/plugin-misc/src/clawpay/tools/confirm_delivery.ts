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
 * Confirm delivery of a service as the seller in a ClawPay escrow
 * @param agent SolanaAgentKit instance (must be the seller)
 * @param escrowAddress The escrow account public key
 * @returns Object containing the transaction signature
 */
export async function confirmClawPayDelivery(
  agent: SolanaAgentKit,
  escrowAddress: PublicKey,
): Promise<ClawPayEscrowResponse> {
  try {
    const seller = agent.wallet.publicKey;

    // Anchor discriminator for "confirm_delivery"
    const discriminator = Buffer.from([
      0xa3, 0x5e, 0x12, 0x7d, 0x44, 0xb8, 0x6f, 0x91,
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: seller, isSigner: true, isWritable: false },
        { pubkey: escrowAddress, isSigner: false, isWritable: true },
      ],
      programId: CLAWPAY_PROGRAM_ID,
      data: discriminator,
    });

    const tx = new Transaction().add(instruction);
    tx.feePayer = seller;
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
    throw new Error(`Failed to confirm delivery: ${err.message}`);
  }
}
