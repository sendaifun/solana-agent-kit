import { Transaction, VersionedTransaction } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";

/**
 * Structured, fail-safe result of a transaction simulation.
 */
export interface SimulateTransactionResult {
  willSucceed: boolean;
  error: string | null;
  unitsConsumed: number | null;
  logs: string[];
  summary: string;
}

/**
 * @name        simulateTransactionPreflight
 * @description Simulate a serialized transaction against the current chain
 *              state before signing or sending it. Supports both legacy
 *              `Transaction` and `VersionedTransaction`. Never throws: any
 *              deserialize or RPC failure resolves to a fail-safe result with
 *              `willSucceed: false` so callers never assume an unsimulated
 *              transaction is safe.
 * @param       agent     SolanaAgentKit instance (provides the RPC connection)
 * @param       base64Tx  Base64-encoded serialized transaction
 * @param       opts      Optional flags (e.g. include logs, default true)
 * @returns     A structured {@link SimulateTransactionResult}
 */
export async function simulateTransactionPreflight(
  agent: SolanaAgentKit,
  base64Tx: string,
  opts?: { includeLogs?: boolean },
): Promise<SimulateTransactionResult> {
  const includeLogs = opts?.includeLogs ?? true;

  const failSafe = (message: string): SimulateTransactionResult => {
    return {
      willSucceed: false,
      error: message,
      unitsConsumed: null,
      logs: [],
      summary: "⛔ could not simulate — do not assume safe",
    };
  };

  let rawTx: Buffer;
  try {
    rawTx = Buffer.from(base64Tx, "base64");
    if (rawTx.length === 0) {
      return failSafe("empty or invalid base64 transaction");
    }
  } catch (error: any) {
    return failSafe(`invalid base64 input: ${error?.message ?? error}`);
  }

  try {
    let value: {
      err: unknown;
      logs: string[] | null;
      unitsConsumed?: number;
    };

    try {
      // Try versioned transaction first.
      const versionedTx = VersionedTransaction.deserialize(rawTx);
      const result = await agent.connection.simulateTransaction(versionedTx, {
        sigVerify: false,
        replaceRecentBlockhash: true,
      });
      value = result.value;
    } catch {
      // Fall back to a legacy transaction.
      const legacyTx = Transaction.from(rawTx);
      const result = await agent.connection.simulateTransaction(legacyTx);
      value = result.value;
    }

    const logs = includeLogs ? (value.logs ?? []) : [];
    const unitsConsumed =
      typeof value.unitsConsumed === "number" ? value.unitsConsumed : null;

    if (value.err) {
      return {
        willSucceed: false,
        error:
          typeof value.err === "string" ? value.err : JSON.stringify(value.err),
        unitsConsumed,
        logs,
        summary: "❌ transaction would fail — sending it will likely cost fees",
      };
    }

    return {
      willSucceed: true,
      error: null,
      unitsConsumed,
      logs,
      summary:
        unitsConsumed !== null
          ? `✅ transaction would succeed (${unitsConsumed} compute units)`
          : "✅ transaction would succeed",
    };
  } catch (error: any) {
    return failSafe(
      `could not deserialize or simulate transaction: ${
        error?.message ?? error
      }`,
    );
  }
}
