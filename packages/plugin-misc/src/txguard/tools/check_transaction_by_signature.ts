import { SolanaAgentKit } from "solana-agent-kit";
import {
  type SafetyVerdict,
  checkTransactionFromRpc,
} from "./check_transaction_safety";

/**
 * Fetch a confirmed transaction by signature and run the deterministic safety check on it.
 * Useful for auditing a tx the agent (or a counterparty) already submitted. Read-only.
 *
 * @param agent     the Solana Agent Kit instance (uses `agent.connection`)
 * @param signature base-58 transaction signature
 * @param owner     optional pubkey the agent controls (defaults to the agent wallet)
 */
export async function checkTransactionBySignature(
  agent: SolanaAgentKit,
  signature: string,
  owner?: string,
): Promise<SafetyVerdict> {
  const parsed = await agent.connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  if (!parsed) {
    return {
      verdict: "halt",
      safe_to_sign: false,
      risk: 1,
      n_instructions: 0,
      flags: [
        {
          rule: "tx_not_found",
          severity: "halt",
          ix: -1,
          detail: `transaction ${signature.slice(0, 12)}… not found / not yet confirmed — cannot verify`,
        },
      ],
      summary: "⛔ transaction not found — cannot verify, do not trust",
    };
  }
  const self = owner ?? agent.wallet.publicKey.toBase58();
  return checkTransactionFromRpc(parsed, self);
}
