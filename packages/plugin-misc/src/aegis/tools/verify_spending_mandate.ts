import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";

export interface SpendingMandatePolicy {
  recipient: string;
  amountSol: number;
  maxSingleTxSol: number;
  allowedRecipients?: string[];
}

export interface MandateVerificationResult {
  allowed: boolean;
  reason: string;
  walletBalanceSol: number;
  postTxBalanceSol: number;
  recipientValid: boolean;
}

export async function verifySpendingMandate(
  agent: SolanaAgentKit,
  policy: SpendingMandatePolicy,
): Promise<MandateVerificationResult> {
  let recipientPubkey: PublicKey;
  try {
    recipientPubkey = new PublicKey(policy.recipient);
  } catch {
    return {
      allowed: false,
      reason: `Invalid Solana recipient public key: ${policy.recipient}`,
      walletBalanceSol: 0,
      postTxBalanceSol: 0,
      recipientValid: false,
    };
  }

  if (policy.amountSol <= 0) {
    return {
      allowed: false,
      reason: "Transaction amount must be greater than 0 SOL.",
      walletBalanceSol: 0,
      postTxBalanceSol: 0,
      recipientValid: true,
    };
  }

  if (policy.amountSol > policy.maxSingleTxSol) {
    return {
      allowed: false,
      reason: `Amount (${policy.amountSol} SOL) exceeds agent mandate cap (${policy.maxSingleTxSol} SOL).`,
      walletBalanceSol: 0,
      postTxBalanceSol: 0,
      recipientValid: true,
    };
  }

  if (
    policy.allowedRecipients &&
    policy.allowedRecipients.length > 0 &&
    !policy.allowedRecipients.includes(recipientPubkey.toBase58())
  ) {
    return {
      allowed: false,
      reason: `Recipient ${recipientPubkey.toBase58()} is not in the agent's allowlisted recipients.`,
      walletBalanceSol: 0,
      postTxBalanceSol: 0,
      recipientValid: true,
    };
  }

  const balanceLamports = await agent.connection.getBalance(
    agent.wallet.publicKey,
  );
  const walletBalanceSol = balanceLamports / LAMPORTS_PER_SOL;
  const postTxBalanceSol = Number(
    (walletBalanceSol - policy.amountSol).toFixed(6),
  );

  if (postTxBalanceSol < 0.002) {
    return {
      allowed: false,
      reason: `Insufficient SOL balance (${walletBalanceSol.toFixed(4)} SOL) to cover ${policy.amountSol} SOL + rent/fees.`,
      walletBalanceSol,
      postTxBalanceSol,
      recipientValid: true,
    };
  }

  return {
    allowed: true,
    reason: "Transaction satisfies all Aegis spending mandate policies.",
    walletBalanceSol,
    postTxBalanceSol,
    recipientValid: true,
  };
}
