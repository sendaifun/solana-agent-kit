import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { ClawPayEscrowResponse } from "../types";

const CLAWPAY_PROGRAM_ID = new PublicKey(
  "F2nwkN9i2kUDgjfLwHwz2zPBXDxLDFjzmnV4TXT6BWeD",
);

/**
 * Create a new escrow on ClawPay for trustless agent-to-agent payments
 * @param agent SolanaAgentKit instance
 * @param seller The seller's public key who will deliver the service
 * @param amount Amount of SOL to lock in escrow
 * @param deadline Deadline in seconds from now for the seller to deliver
 * @param description Description of the service being purchased
 * @returns Object containing the escrow address and transaction signature
 */
export async function createClawPayEscrow(
  agent: SolanaAgentKit,
  seller: PublicKey,
  amount: number,
  deadline: number,
  description: string,
): Promise<ClawPayEscrowResponse> {
  try {
    const buyer = agent.wallet.publicKey;

    // Derive escrow PDA
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        buyer.toBuffer(),
        seller.toBuffer(),
        Buffer.from(
          new Uint8Array(new BigInt64Array([BigInt(Date.now())]).buffer),
        ),
      ],
      CLAWPAY_PROGRAM_ID,
    );

    // Build the create_escrow instruction
    // Anchor discriminator for "create_escrow"
    const discriminator = Buffer.from([
      0x18, 0x6b, 0x56, 0x5f, 0xb6, 0x2a, 0x37, 0xc0,
    ]);

    const amountLamports = BigInt(Math.floor(amount * LAMPORTS_PER_SOL));
    const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + deadline);

    const descriptionBytes = Buffer.from(description, "utf-8");
    const descriptionLen = Buffer.alloc(4);
    descriptionLen.writeUInt32LE(descriptionBytes.length);

    const amountBuf = Buffer.alloc(8);
    amountBuf.writeBigUInt64LE(amountLamports);

    const deadlineBuf = Buffer.alloc(8);
    deadlineBuf.writeBigInt64LE(deadlineTimestamp);

    const data = Buffer.concat([
      discriminator,
      amountBuf,
      deadlineBuf,
      descriptionLen,
      descriptionBytes,
    ]);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: buyer, isSigner: true, isWritable: true },
        { pubkey: seller, isSigner: false, isWritable: false },
        { pubkey: escrowPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: CLAWPAY_PROGRAM_ID,
      data,
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
      escrowAddress: escrowPda.toBase58(),
      signature,
    };
  } catch (err: any) {
    throw new Error(`Failed to create escrow: ${err.message}`);
  }
}
