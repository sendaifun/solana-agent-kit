import { type Transaction, VersionedTransaction } from "@solana/web3.js";
import {
  type RepairResult,
  repair,
  sendWithRepair,
  verifyRepair,
} from "@txwhy/sdk";
import type { SolanaAgentKit } from "solana-agent-kit";

/**
 * Simulate a transaction, repair it if it would fail, verify the repair
 * locally, then sign with the agent's wallet and send.
 *
 * If the transaction passes simulation as built, it is signed and sent and
 * TxWhy is never contacted. Otherwise the unsigned bytes go to TxWhy, the
 * rebuilt transaction is checked on this machine (same fee payer, same
 * signers, every non-compute-budget instruction byte for byte, at most one
 * equivalent Jupiter swap), and only then reaches the wallet. Keys never
 * leave the process.
 *
 * With `agent.config.signOnly`, the (repaired) transaction is signed and
 * returned instead of sent.
 *
 * @param agent SolanaAgentKit instance
 * @param transaction A Transaction, VersionedTransaction, or base64 string
 * @returns The signature, or the signed transaction when signOnly, plus the
 *   repairs that were applied (empty when it was fine as built)
 */
export async function txwhySendWithRepair(
  agent: SolanaAgentKit,
  transaction: Transaction | VersionedTransaction | string,
): Promise<{
  signature?: string;
  signedTransaction?: Transaction | VersionedTransaction;
  repairs: RepairResult[];
}> {
  const tx =
    typeof transaction === "string"
      ? VersionedTransaction.deserialize(Buffer.from(transaction, "base64"))
      : transaction;

  if (!agent.config.signOnly) {
    const { signature, repairs } = await sendWithRepair(
      agent.connection,
      tx,
      (t) => agent.wallet.signTransaction(t),
      { client: "sak" },
    );
    return { signature, repairs };
  }

  // signOnly: the same steps without the send.
  const versioned =
    tx instanceof VersionedTransaction
      ? tx
      : VersionedTransaction.deserialize(
          tx.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
        );
  const simulation = await agent.connection.simulateTransaction(versioned, {
    sigVerify: false,
  });
  if (!simulation.value.err) {
    return {
      signedTransaction: await agent.wallet.signTransaction(tx),
      repairs: [],
    };
  }
  const result = await repair({ transaction: versioned }, { client: "sak" });
  if (result.status !== "repaired" || !result.repairedTransaction) {
    throw new Error(result.summary);
  }
  const verification = await verifyRepair(
    agent.connection,
    versioned,
    result.repairedTransaction,
  );
  if (!verification.ok) {
    throw new Error(
      `Refusing to sign: the repair failed local verification. ${verification.violations.join(" ")}`,
    );
  }
  const rebuilt = VersionedTransaction.deserialize(
    Buffer.from(result.repairedTransaction, "base64"),
  );
  return {
    signedTransaction: await agent.wallet.signTransaction(rebuilt),
    repairs: [result],
  };
}
