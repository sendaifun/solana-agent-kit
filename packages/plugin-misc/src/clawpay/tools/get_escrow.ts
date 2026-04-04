import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { ClawPayEscrowStatus } from "../types";

const CLAWPAY_PROGRAM_ID = new PublicKey(
  "F2nwkN9i2kUDgjfLwHwz2zPBXDxLDFjzmnV4TXT6BWeD",
);

const ESCROW_STATES = ["Created", "Funded", "Delivered", "Released", "Refunded", "Disputed"];

/**
 * Get the status of a ClawPay escrow account
 * @param agent SolanaAgentKit instance
 * @param escrowAddress The escrow account public key
 * @returns Object containing escrow details and current state
 */
export async function getClawPayEscrow(
  agent: SolanaAgentKit,
  escrowAddress: PublicKey,
): Promise<ClawPayEscrowStatus> {
  try {
    const accountInfo = await agent.connection.getAccountInfo(escrowAddress);

    if (!accountInfo) {
      throw new Error("Escrow account not found");
    }

    if (!accountInfo.owner.equals(CLAWPAY_PROGRAM_ID)) {
      throw new Error("Account is not a ClawPay escrow");
    }

    const data = accountInfo.data;

    // Skip 8-byte Anchor discriminator
    const offset = 8;

    // Parse escrow account data (Anchor serialization)
    const buyer = new PublicKey(data.subarray(offset, offset + 32));
    const seller = new PublicKey(data.subarray(offset + 32, offset + 64));
    const amountLamports = data.readBigUInt64LE(offset + 64);
    const deadline = Number(data.readBigInt64LE(offset + 72));
    const stateIndex = data.readUInt8(offset + 80);

    const amount = Number(amountLamports) / LAMPORTS_PER_SOL;
    const state = ESCROW_STATES[stateIndex] || "Unknown";

    return {
      status: "success",
      escrowAddress: escrowAddress.toBase58(),
      buyer: buyer.toBase58(),
      seller: seller.toBase58(),
      amount,
      state,
      deadline,
    };
  } catch (err: any) {
    throw new Error(`Failed to get escrow status: ${err.message}`);
  }
}
