// Landing transactions on a busy cluster: a measured compute-unit limit, a priority fee, and rebroadcasting the
// same signed bytes until the transaction is confirmed or its blockhash expires. A single send with no priority
// fee is often dropped on mainnet without any error (the client then only sees the blockhash expire).
import {
  type AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
const MAX_CU = 1_400_000;
/** micro-lamports per compute unit: floor on mainnet, ceiling everywhere */
export const PRIORITY_FLOOR = 100_000;
export const PRIORITY_CEIL = 2_000_000;
/** the priority fee of one transaction never exceeds this many lamports (0.002 SOL) */
export const PRIORITY_MAX_LAMPORTS = 2_000_000;
const RESEND_MS = 2_000;

let override: number | undefined;
/** Fixes the priority price (micro-lamports per CU) for every send; undefined restores the automatic price. */
export function setPriorityPrice(microLamports: number | undefined): void {
  override = microLamports;
}

const priceCache = new WeakMap<Connection, { at: number; price: number }>();
const genesisCache = new WeakMap<Connection, Promise<string>>();

/**
 * Per-send priority-fee limits that replace PRIORITY_CEIL / PRIORITY_MAX_LAMPORTS for that send (a relayer's
 * paid priority lane). Omitted: the defaults above.
 */
export interface PriorityOptions {
  /** ceiling in micro-lamports per CU */
  priceCeil?: number;
  /** the priority fee of one transaction never exceeds this many lamports */
  maxLamports?: number;
}

/**
 * Priority price in micro-lamports per CU: the 75th percentile of recent fees, at least PRIORITY_FLOOR on
 * mainnet, at most `ceil` (default PRIORITY_CEIL). 0 on a cluster with no priority fees at all (local
 * validators), so tests pay exactly what they did before.
 */
export async function priorityPrice(
  connection: Connection,
  ceil = PRIORITY_CEIL,
): Promise<number> {
  if (override !== undefined) {
    return override;
  }
  const hit = priceCache.get(connection);
  if (hit && Date.now() - hit.at < 20_000) {
    return Math.min(hit.price, ceil);
  }
  if (!genesisCache.has(connection)) {
    genesisCache.set(
      connection,
      connection.getGenesisHash().catch(() => ""),
    );
  }
  const [genesis, recent] = await Promise.all([
    genesisCache.get(connection)!,
    connection
      .getRecentPrioritizationFees()
      .catch(() => [] as { prioritizationFee: number }[]),
  ]);
  const fees = recent.map((f) => f.prioritizationFee).sort((a, b) => a - b);
  let price = fees.length ? fees[Math.floor(fees.length * 0.75)] : 0;
  if (genesis === MAINNET_GENESIS) {
    price = Math.max(price, PRIORITY_FLOOR);
  }
  priceCache.set(connection, { at: Date.now(), price });
  return Math.min(price, ceil);
}

const isBudget = (ix: TransactionInstruction) =>
  ix.programId.equals(ComputeBudgetProgram.programId);

/** Placeholders with the size of the two compute-budget instructions `withBudget` adds (for transaction sizing). */
export function budgetReserve(): TransactionInstruction[] {
  return [
    ComputeBudgetProgram.setComputeUnitLimit({ units: MAX_CU }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_CEIL }),
  ];
}

/** Error thrown when a transaction would fail; its message carries the program logs (customErrorCode reads them). */
export class SimulationError extends Error {
  constructor(
    readonly err: unknown,
    readonly logs: string[],
  ) {
    super(
      `transaction simulation failed: ${JSON.stringify(err)}\n${logs.join("\n")}`,
    );
  }
}

/**
 * Replaces any compute-budget instructions in `ixs` with a limit measured by simulation (+20%) and a priority
 * price. Throws SimulationError when the transaction would fail.
 */
export async function withBudget(
  connection: Connection,
  feePayer: PublicKey,
  ixs: TransactionInstruction[],
  lookupTables: AddressLookupTableAccount[] = [],
  priority: PriorityOptions = {},
): Promise<TransactionInstruction[]> {
  const body = ixs.filter((ix) => !isBudget(ix));
  const maxLamports = priority.maxLamports ?? PRIORITY_MAX_LAMPORTS;
  const [{ blockhash }, price] = await Promise.all([
    connection.getLatestBlockhash("confirmed"),
    priorityPrice(connection, priority.priceCeil ?? PRIORITY_CEIL),
  ]);
  const probe = new VersionedTransaction(
    new TransactionMessage({
      payerKey: feePayer,
      recentBlockhash: blockhash,
      instructions: [
        ComputeBudgetProgram.setComputeUnitLimit({ units: MAX_CU }),
        ...body,
      ],
    }).compileToV0Message(lookupTables),
  );
  const sim = await connection.simulateTransaction(probe, {
    sigVerify: false,
    replaceRecentBlockhash: true,
    commitment: "confirmed",
  });
  if (sim.value.err) {
    throw new SimulationError(sim.value.err, sim.value.logs ?? []);
  }
  const used = sim.value.unitsConsumed ?? MAX_CU;
  const units = Math.min(
    MAX_CU,
    Math.max(10_000, Math.ceil(used * 1.2) + 5_000),
  );
  const micro = Math.min(price, Math.floor((maxLamports * 1_000_000) / units));
  return [
    ComputeBudgetProgram.setComputeUnitLimit({ units }),
    ...(micro > 0
      ? [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: micro })]
      : []),
    ...body,
  ];
}

/**
 * Sends already-signed transaction bytes and keeps rebroadcasting them every 2 s until the signature is
 * confirmed (returns) or fails on chain / the blockhash expires (throws).
 */
export async function sendSigned(
  connection: Connection,
  raw: Uint8Array,
  signature: string,
  lastValidBlockHeight: number,
): Promise<void> {
  const resend = () =>
    connection
      .sendRawTransaction(raw, { skipPreflight: true, maxRetries: 0 })
      .catch(() => undefined);
  await resend();
  for (;;) {
    await new Promise((r) => setTimeout(r, RESEND_MS));
    const st = (
      await connection.getSignatureStatuses([signature]).catch(() => null)
    )?.value?.[0];
    if (st?.err) {
      throw new Error(
        `transaction ${signature} failed: ${JSON.stringify(st.err)}`,
      );
    }
    if (
      st?.confirmationStatus === "confirmed" ||
      st?.confirmationStatus === "finalized"
    ) {
      return;
    }
    const height = await connection.getBlockHeight("confirmed").catch(() => 0);
    if (height > lastValidBlockHeight) {
      // one last look: it may have landed in the final slots
      const last = (
        await connection
          .getSignatureStatuses([signature], { searchTransactionHistory: true })
          .catch(() => null)
      )?.value?.[0];
      if (last?.err) {
        throw new Error(
          `transaction ${signature} failed: ${JSON.stringify(last.err)}`,
        );
      }
      if (last?.confirmationStatus) {
        return;
      }
      throw new Error(
        `transaction ${signature} expired before it was confirmed; nothing was spent by it. Please try again.`,
      );
    }
    await resend();
  }
}

/** Legacy transaction: budget, sign, send with rebroadcast. Returns the signature. */
export async function sendLegacy(
  connection: Connection,
  payer: { publicKey: PublicKey },
  signers: Parameters<Transaction["sign"]>,
  ixs: TransactionInstruction[],
): Promise<string> {
  const full = await withBudget(connection, payer.publicKey, ixs);
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({
    feePayer: payer.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(...full);
  tx.sign(...signers);
  const raw = tx.serialize();
  const signature = encodeSig(tx.signature!);
  await sendSigned(connection, raw, signature, lastValidBlockHeight);
  return signature;
}

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
/** base58 of a 64-byte signature */
export function encodeSig(bytes: Uint8Array): string {
  let n = 0n;
  for (const b of bytes) {
    n = (n << 8n) | BigInt(b);
  }
  let out = "";
  while (n > 0n) {
    out = ALPHABET[Number(n % 58n)] + out;
    n /= 58n;
  }
  for (const b of bytes) {
    if (b !== 0) {
      break;
    }
    out = "1" + out;
  }
  return out;
}
