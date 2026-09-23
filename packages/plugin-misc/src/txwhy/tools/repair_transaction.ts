import {
  type RepairResult,
  type Verification,
  repair,
  verifyRepair,
} from "@txwhy/sdk";
import type { SolanaAgentKit } from "solana-agent-kit";

/**
 * Diagnose a failing Solana transaction and get back a rebuilt one.
 *
 * Send either the base64 of a transaction you are about to submit (signed or
 * unsigned) or the signature of one that already failed on chain. TxWhy
 * simulates it against live chain state, names the exact failing instruction
 * and error, and when the cause is one it can fix (compute budget, expired
 * blockhash, priority fee, Jupiter slippage) returns an unsigned rebuilt
 * transaction together with a simulation proof that it now passes.
 *
 * No API key is needed. Nothing about the caller is stored.
 *
 * @param agent SolanaAgentKit instance
 * @param input Either `{ transaction }` (base64) or `{ signature }`
 * @returns The repair result: status, cause, changes, rebuilt transaction
 */
export async function txwhyRepairTransaction(
  agent: SolanaAgentKit,
  input: { transaction?: string; signature?: string },
): Promise<RepairResult & { verifiedLocally?: Verification }> {
  const result =
    input.signature !== undefined
      ? await repair({ signature: input.signature }, { client: "sak" })
      : await repair(
          { transaction: input.transaction ?? "" },
          { client: "sak" },
        );

  // When we hold the original bytes, prove on this side that the rebuilt
  // transaction only differs in the allowed ways (compute budget, blockhash,
  // an equivalent Jupiter swap) before anyone signs it.
  if (input.transaction && result.repairedTransaction) {
    const verifiedLocally = await verifyRepair(
      agent.connection,
      input.transaction,
      result.repairedTransaction,
    );
    if (!verifiedLocally.ok) {
      throw new Error(
        `TxWhy returned a transaction that failed local verification: ${verifiedLocally.violations.join(" ")}`,
      );
    }
    return { ...result, verifiedLocally };
  }
  return result;
}
