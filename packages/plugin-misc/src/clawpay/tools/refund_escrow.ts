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
 * Refund an expired escrow back to the buyer
 * Can be called by anyone after the deadline has passed without delivery
 * @param agent SolanaAgentKit instance
 * @param escrowAddress The escrow account public key
 * @param buyer The buyer's public key to receive the refund
 * @returns Object containing the transaction signature
 */
export async function refundClawPayEscrow(
  agent: SolanaAgentKit,
  escrowAddress: PublicKey,
  buyer: PublicKey,
): Promise<ClawPayEscrowResponse> {
  try {
    // Anchor discriminator for "refund_escrow"
    const discriminator = Buffer.from([
      0x51, 0xf8, 0x0c, 0x30, 0xea, 0x47, 0x15, 0xf2,
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: agent.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: buyer, isSigner: false, isWritable: true },
        { pubkey: escrowAddress, isSigner: false, isWritable: true },
      ],
      programId: CLAWPAY_PROGRAM_ID,
      data: discriminator,
    });

    const tx = new Transaction().add(instruction);
    tx.feePayer = agent.wallet.publicKey;
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
    throw new Error(`Failed to refund escrow: ${err.message}`);
  }
}
