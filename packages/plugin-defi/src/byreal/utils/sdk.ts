import { ByrealSDK } from "@byreal-io/byreal-sdk";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";

/**
 * Create a ByrealSDK instance from a SolanaAgentKit agent.
 */
export function createByrealSDK(agent: SolanaAgentKit): ByrealSDK {
  return new ByrealSDK({ connection: agent.connection });
}

/**
 * Unwrap a Byreal Result<T, ByrealError>.
 * Returns T on success, throws on error.
 */
export function unwrapResult<T>(
  result: { ok: true; value: T } | { ok: false; error: any },
): T {
  if (!result.ok) {
    const msg = result.error?.message ?? String(result.error);
    throw new Error(msg);
  }
  return result.value;
}

/**
 * Sign and send a transaction built by the Byreal SDK.
 *
 * We avoid `agent.wallet.signAndSendTransaction` because it uses
 * `instanceof VersionedTransaction` internally, which fails when
 * the tx comes from a different copy of @solana/web3.js (e.g. via
 * @byreal-io/byreal-clmm-sdk).
 *
 * Instead we use `agent.wallet.signTransaction` (duck-typing based)
 * + `agent.connection.sendRawTransaction`.
 */
export async function signAndSend(
  agent: SolanaAgentKit,
  transaction: Transaction | VersionedTransaction,
): Promise<string> {
  if (agent.config.signOnly) {
    const signed = await agent.wallet.signTransaction(transaction);
    // Return serialized base64 so the caller gets something useful
    return Buffer.from(signed.serialize()).toString("base64");
  }

  const signed = await agent.wallet.signTransaction(transaction);
  const signature = await agent.connection.sendRawTransaction(
    signed.serialize(),
  );
  return signature;
}
