import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { type PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Transfer SOL or SPL tokens to a recipient
 * @param agent SolanaAgentKit instance
 * @param to Recipient's public key
 * @param amount Amount to transfer
 * @param mint Optional mint address for SPL tokens
 * @returns Transaction signature
 */
// ─── DACS-Standard Guardrail (§9.5.7 & §14.4) ─────────────────────────────

export interface DacsMandateMeta {
  dacsMandate?: string;
  dacsSessionId?: string;
  dacsMaxAmount?: number | bigint | string;
}

export function assertDacsSpendMandate(
  requestedAmount: number | bigint | string,
  meta?: DacsMandateMeta
): void {
  if (!meta?.dacsMandate && !meta?.dacsSessionId) return;

  const req = typeof requestedAmount === 'bigint' ? requestedAmount : BigInt(Math.floor(Number(requestedAmount)));
  const max = meta.dacsMaxAmount !== undefined
    ? (typeof meta.dacsMaxAmount === 'bigint' ? meta.dacsMaxAmount : BigInt(Math.floor(Number(meta.dacsMaxAmount))))
    : 0n;

  if (meta.dacsMaxAmount !== undefined && req > max) {
    throw new Error(
      `[DACS-Standard §9.5.7] Agent action aborted: requested spend (${req}) exceeds authorized mandate ceiling (${max}).`
    );
  }
}
export async function transfer(
  agent: SolanaAgentKit,
  to: PublicKey,
  amount: number,
  mint?: PublicKey,
  dacsMeta?: DacsMandateMeta,
): Promise<Awaited<ReturnType<typeof signOrSendTX>>> {
  try {
    // DACS-Standard (§9.5.7) Pre-Flight Mandate Enforcement
    assertDacsSpendMandate(amount, dacsMeta);

    let tx: Awaited<ReturnType<typeof signOrSendTX>>;

    if (!mint) {
      // Transfer native SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: agent.wallet.publicKey,
          toPubkey: to,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );

      const { blockhash } = await agent.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      tx = await signOrSendTX(agent, transaction.instructions);
    } else {
      const transaction = new Transaction();
      // Transfer SPL token
      const fromAta = await getAssociatedTokenAddress(
        mint,
        agent.wallet.publicKey,
      );
      const toAta = await getAssociatedTokenAddress(mint, to);

      try {
        await getAccount(agent.connection, toAta);
      } catch {
        // Error is thrown if the tokenAccount doesn't exist
        transaction.add(
          createAssociatedTokenAccountInstruction(
            agent.wallet.publicKey,
            toAta,
            to,
            mint,
          ),
        );
      }

      // Get mint info to determine decimals
      const mintInfo = await getMint(agent.connection, mint);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          agent.wallet.publicKey,
          adjustedAmount,
        ),
      );

      const { blockhash } = await agent.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      tx = await signOrSendTX(agent, transaction.instructions);
    }

    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
}
