import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
// Address lookup tables (ALTs) and v0 transactions for stipend_pool operations.
//
// Every proof-bearing operation stages `borsh(Proof, Args, ext)` in a Buffer and then sends the operation
// (docs/SOLANA-PORT.md, solana/README.md "Buffer flow"). The legacy path (`SolanaPool.run` without lookup
// tables, `uploadBuffer`) sends: open + first chunk, the grows, one transaction per 900-byte chunk, and the
// operation on its own. The v0 path here plans the same instructions so that each transaction carries as
// many payload bytes as fit in the 1,232-byte limit, and the last chunk travels in the same transaction as
// the operation. The pool's static accounts (pool PDA, vault authority, event authority, token programs,
// per-mint vaults and mints) are read from a lookup table, so they cost one byte each instead of 32 in that
// final transaction. Small payloads (a disclosure or stream check) fit open, write and operation in one.
//
// The plan is pure: it measures the serialized size of each candidate transaction, so it is exact for the
// accounts and lookup tables given. Programs that are invoked (stipend_pool, ComputeBudget) and signers can
// never be loaded from a table; web3.js keeps them static.
import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PACKET_DATA_SIZE,
  PublicKey,
  SystemProgram,
  TransactionError,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { randomSeed } from "./buffer.js";
import {
  bufferPda,
  eventAuthorityPda,
  poolPda,
  vaultAuthorityPda,
  vaultPda,
} from "./pda.js";
import {
  BUFFER_GROW_STEP,
  BUFFER_MAX_INIT,
  BUFFER_MAX_LEN,
  bufferCloseIx,
  bufferGrowIx,
  bufferOpenIx,
  bufferWriteIx,
} from "./program.js";
import {
  type PriorityOptions,
  budgetReserve,
  encodeSig,
  sendSigned,
  withBudget,
} from "./send.js";

/** Addresses per extend instruction; keeps an extend transaction under the size limit. */
export const ALT_EXTEND_BATCH = 20;
/** A lookup table holds at most this many addresses. */
export const ALT_MAX_ADDRESSES = 256;
/** buffer_grow instructions per transaction (as in uploadBuffer). */
const GROWS_PER_TX = 8;
/** A placeholder blockhash for sizing (any 32 bytes; it is not sent). */
const SIZING_BLOCKHASH = PublicKey.default.toBase58();

export interface MintAccounts {
  mint: PublicKey;
  tokenProgram: PublicKey;
}

/**
 * The static accounts of a stipend_pool deployment that every operation names: pool PDA, vault and event
 * authorities, System, SPL Token, Token-2022 and the associated-token program, plus each listed mint and its
 * vault. `extra` adds anything else (a relayer's fee accounts, a lender's token account). Duplicates removed.
 */
export function poolLookupAddresses(
  programId: PublicKey,
  mints: MintAccounts[] = [],
  extra: PublicKey[] = [],
): PublicKey[] {
  const out: PublicKey[] = [
    poolPda(programId),
    vaultAuthorityPda(programId),
    eventAuthorityPda(programId),
    SystemProgram.programId,
    TOKEN_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  ];
  for (const m of mints) {
    out.push(m.mint, vaultPda(programId, m.mint));
  }
  out.push(...extra);
  const seen = new Set<string>();
  const unique = out.filter((k) =>
    seen.has(k.toBase58()) ? false : (seen.add(k.toBase58()), true),
  );
  if (unique.length > ALT_MAX_ADDRESSES) {
    throw new Error(
      `a lookup table holds at most ${ALT_MAX_ADDRESSES} addresses`,
    );
  }
  return unique;
}

/** Instructions that create a lookup table owned by `authority` and fill it with `addresses` (first batch in the same transaction). */
export function createLookupTableInstructions(
  authority: PublicKey,
  payer: PublicKey,
  recentSlot: number,
  addresses: PublicKey[],
): { address: PublicKey; transactions: TransactionInstruction[][] } {
  const [create, address] = AddressLookupTableProgram.createLookupTable({
    authority,
    payer,
    recentSlot,
  });
  const batches = extendBatches(address, authority, payer, addresses);
  return {
    address,
    transactions: [[create, ...(batches[0] ?? [])], ...batches.slice(1)],
  };
}

/** Extend instructions for `addresses`, one per transaction, ALT_EXTEND_BATCH at a time. */
export function extendBatches(
  lookupTable: PublicKey,
  authority: PublicKey,
  payer: PublicKey,
  addresses: PublicKey[],
): TransactionInstruction[][] {
  const out: TransactionInstruction[][] = [];
  for (let i = 0; i < addresses.length; i += ALT_EXTEND_BATCH) {
    out.push([
      AddressLookupTableProgram.extendLookupTable({
        lookupTable,
        authority,
        payer,
        addresses: addresses.slice(i, i + ALT_EXTEND_BATCH),
      }),
    ]);
  }
  return out;
}

/** An unsigned v0 transaction of `instructions`, compiled against `lookupTables`. */
export function buildV0Transaction(
  payer: PublicKey,
  instructions: TransactionInstruction[],
  recentBlockhash: string,
  lookupTables: AddressLookupTableAccount[] = [],
): VersionedTransaction {
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash,
    instructions,
  }).compileToV0Message(lookupTables);
  return new VersionedTransaction(message);
}

/**
 * Serialized size in bytes of a v0 transaction of `instructions` (signatures counted as 64 bytes each), or
 * Infinity when it cannot be compiled (too many accounts).
 */
export function v0Size(
  payer: PublicKey,
  instructions: TransactionInstruction[],
  lookupTables: AddressLookupTableAccount[] = [],
): number {
  try {
    return buildV0Transaction(
      payer,
      instructions,
      SIZING_BLOCKHASH,
      lookupTables,
    ).serialize().length;
  } catch {
    return Infinity;
  }
}

/** Whether `instructions` fit in one transaction together with the compute-budget instructions sendV0 adds. */
export const fits = (
  payer: PublicKey,
  instructions: TransactionInstruction[],
  lookupTables: AddressLookupTableAccount[] = [],
) =>
  v0Size(
    payer,
    [
      ...budgetReserve(),
      ...instructions.filter(
        (ix) => !ix.programId.equals(ComputeBudgetProgram.programId),
      ),
    ],
    lookupTables,
  ) <= PACKET_DATA_SIZE;

/** Largest n in [lo, hi] with ok(n), or lo - 1 when ok(lo) is false. ok must be monotone (true then false). */
function largest(lo: number, hi: number, ok: (n: number) => boolean): number {
  if (hi < lo || !ok(lo)) {
    return lo - 1;
  }
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ok(mid)) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}

export interface OpPlanInput {
  programId: PublicKey;
  /** buffer authority and fee payer of every transaction (the operation's payer) */
  authority: PublicKey;
  payload: Uint8Array;
  /** builds the operation instruction for the buffer address */
  op: (buffer: PublicKey) => TransactionInstruction;
  /** instructions to run in the final transaction before the operation (e.g. an idempotent ATA creation) */
  pre?: TransactionInstruction[];
  lookupTables?: AddressLookupTableAccount[];
  /** compute-unit limit of the final transaction; omitted: no ComputeBudget instruction */
  cuLimit?: number;
  seed?: bigint;
}

/**
 * The transactions that stage `payload` and run the operation:
 * - `setup`: sent in order (open + first chunk, then the grows);
 * - `writes`: independent, any order (chunks sized to the limit);
 * - `final`: the last chunk (when any) plus `pre` plus the operation, compiled against the lookup tables.
 * When the whole payload fits, `setup` and `writes` are empty and `final` opens, writes and runs at once.
 */
export interface OpPlan {
  seed: bigint;
  buffer: PublicKey;
  setup: TransactionInstruction[][];
  writes: TransactionInstruction[][];
  final: TransactionInstruction[];
  lookupTables: AddressLookupTableAccount[];
}

export function planOperation(p: OpPlanInput): OpPlan {
  const { programId, authority, payload } = p;
  if (payload.length === 0 || payload.length > BUFFER_MAX_LEN) {
    throw new Error(`payload must be 1..${BUFFER_MAX_LEN} bytes`);
  }
  const seed = p.seed ?? randomSeed();
  const buffer = bufferPda(programId, authority, seed);
  const tables = p.lookupTables ?? [];
  const cu = p.cuLimit
    ? [ComputeBudgetProgram.setComputeUnitLimit({ units: p.cuLimit })]
    : [];
  const opIx = p.op(buffer);
  const pre = p.pre ?? [];
  const write = (off: number, end: number) =>
    bufferWriteIx(programId, authority, seed, off, payload.subarray(off, end));
  const open = () => bufferOpenIx(programId, authority, seed, payload.length);
  const finalWith = (from: number) => [
    ...cu,
    ...(from < payload.length ? [write(from, payload.length)] : []),
    ...pre,
    opIx,
  ];

  // 1. everything in one transaction
  if (payload.length <= BUFFER_MAX_INIT) {
    const one = [...cu, open(), write(0, payload.length), ...pre, opIx];
    if (fits(authority, one, tables)) {
      return {
        seed,
        buffer,
        setup: [],
        writes: [],
        final: one,
        lookupTables: tables,
      };
    }
  }

  // 2. open + head
  const headMax = Math.min(payload.length - 1, BUFFER_MAX_INIT);
  const head = largest(1, headMax, (n) =>
    fits(authority, [open(), write(0, n)]),
  );
  if (head < 1) {
    throw new Error("buffer_open does not fit in a transaction");
  }
  const setup: TransactionInstruction[][] = [[open(), write(0, head)]];
  const grows = Math.max(
    0,
    Math.ceil((payload.length - BUFFER_MAX_INIT) / BUFFER_GROW_STEP),
  );
  for (let g = 0; g < grows; g += GROWS_PER_TX) {
    setup.push(
      Array.from({ length: Math.min(GROWS_PER_TX, grows - g) }, () =>
        bufferGrowIx(programId, authority, seed),
      ),
    );
  }

  // 3. the tail that rides with the operation (0 bytes when even the operation alone is tight)
  const tailMax = payload.length - head;
  const tail = Math.max(
    0,
    largest(1, tailMax, (n) =>
      fits(authority, finalWith(payload.length - n), tables),
    ),
  );
  const final = finalWith(payload.length - tail);
  if (!fits(authority, final, tables)) {
    throw new Error(
      "the operation does not fit in a transaction even with the lookup tables",
    );
  }

  // 4. the middle, in chunks as large as a lone write allows
  const chunk = largest(1, PACKET_DATA_SIZE, (n) =>
    fits(authority, [write(0, n)]),
  );
  const writes: TransactionInstruction[][] = [];
  for (let off = head; off < payload.length - tail; off += chunk) {
    writes.push([write(off, Math.min(off + chunk, payload.length - tail))]);
  }
  return { seed, buffer, setup, writes, final, lookupTables: tables };
}

/** Number of transactions a plan sends. */
export const planTransactions = (plan: OpPlan) =>
  plan.setup.length + plan.writes.length + 1;

/**
 * The legacy path's transaction count for the same payload (uploadBuffer + a separate operation), to compare
 * with planTransactions.
 */
export function legacyTransactions(
  payloadLength: number,
  writeChunk = 900,
): number {
  const first = Math.min(writeChunk - 100, payloadLength);
  const grows = Math.max(
    0,
    Math.ceil((payloadLength - BUFFER_MAX_INIT) / BUFFER_GROW_STEP),
  );
  return (
    1 +
    Math.ceil(grows / GROWS_PER_TX) +
    Math.ceil((payloadLength - first) / writeChunk) +
    1
  );
}

// ------------------------------------------------------------------ network helpers

export interface SentV0 {
  signature: string;
  computeUnits: number;
  logs: string[];
}

export async function sendV0(
  connection: Connection,
  payer: Keypair,
  instructions: TransactionInstruction[],
  lookupTables: AddressLookupTableAccount[] = [],
  signers: Keypair[] = [],
  priority?: PriorityOptions,
): Promise<SentV0> {
  const full = await withBudget(
    connection,
    payer.publicKey,
    instructions,
    lookupTables,
    priority,
  );
  const latest = await connection.getLatestBlockhash("confirmed");
  const tx = buildV0Transaction(
    payer.publicKey,
    full,
    latest.blockhash,
    lookupTables,
  );
  tx.sign([payer, ...signers]);
  const signature = encodeSig(tx.signatures[0]);
  await sendSigned(
    connection,
    tx.serialize(),
    signature,
    latest.lastValidBlockHeight,
  );
  const info = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  return {
    signature,
    computeUnits: info?.meta?.computeUnitsConsumed ?? -1,
    logs: info?.meta?.logMessages ?? [],
  };
}

export async function simulateV0(
  connection: Connection,
  payer: Keypair,
  instructions: TransactionInstruction[],
  lookupTables: AddressLookupTableAccount[] = [],
  signers: Keypair[] = [],
): Promise<{
  err: TransactionError | null;
  logs: string[];
  computeUnits: number;
}> {
  const latest = await connection.getLatestBlockhash("confirmed");
  const tx = buildV0Transaction(
    payer.publicKey,
    instructions,
    latest.blockhash,
    lookupTables,
  );
  tx.sign([payer, ...signers]);
  const res = await connection.simulateTransaction(tx, {
    commitment: "confirmed",
    sigVerify: false,
  });
  return {
    err: res.value.err,
    logs: res.value.logs ?? [],
    computeUnits: res.value.unitsConsumed ?? -1,
  };
}

/** Sends the setup and write transactions of a plan (writes 16 at a time). Returns their signatures. */
export async function stagePlan(
  connection: Connection,
  payer: Keypair,
  plan: OpPlan,
  priority?: PriorityOptions,
): Promise<string[]> {
  const sigs: string[] = [];
  for (const ixs of plan.setup) {
    sigs.push(
      (await sendV0(connection, payer, ixs, [], [], priority)).signature,
    );
  }
  for (let i = 0; i < plan.writes.length; i += 16) {
    const batch = await Promise.all(
      plan.writes
        .slice(i, i + 16)
        .map((ixs) => sendV0(connection, payer, ixs, [], [], priority)),
    );
    sigs.push(...batch.map((s) => s.signature));
  }
  return sigs;
}

/** Closes a staged buffer (refunds its rent). Ignores a buffer that was never opened or already closed. */
export async function abandonPlan(
  connection: Connection,
  programId: PublicKey,
  payer: Keypair,
  plan: OpPlan,
): Promise<void> {
  if (!(await connection.getAccountInfo(plan.buffer, "confirmed"))) {
    return;
  }
  await sendV0(connection, payer, [
    bufferCloseIx(programId, payer.publicKey, plan.seed),
  ]).catch(() => undefined);
}

/**
 * Creates a lookup table with `addresses`, waits until it is usable (one slot after the last extension) and
 * returns it. `authority` can extend it later (`extendLookupTable`); deactivating and closing it is the
 * authority's business (AddressLookupTableProgram.deactivateLookupTable / closeLookupTable).
 */
export async function createLookupTable(
  connection: Connection,
  authority: Keypair,
  addresses: PublicKey[],
): Promise<AddressLookupTableAccount> {
  const recentSlot = await connection.getSlot("finalized");
  const { address, transactions } = createLookupTableInstructions(
    authority.publicKey,
    authority.publicKey,
    recentSlot,
    addresses,
  );
  for (const ixs of transactions) {
    await sendV0(connection, authority, ixs);
  }
  return waitForLookupTable(connection, address, addresses.length);
}

/** Adds the `addresses` the table does not hold yet; returns the refreshed table. */
export async function extendLookupTable(
  connection: Connection,
  authority: Keypair,
  table: PublicKey,
  addresses: PublicKey[],
): Promise<AddressLookupTableAccount> {
  const current = await fetchLookupTable(connection, table);
  const have = new Set(current.state.addresses.map((k) => k.toBase58()));
  const missing = addresses.filter((k) => !have.has(k.toBase58()));
  if (missing.length === 0) {
    return current;
  }
  if (current.state.addresses.length + missing.length > ALT_MAX_ADDRESSES) {
    throw new Error(
      `a lookup table holds at most ${ALT_MAX_ADDRESSES} addresses`,
    );
  }
  for (const ixs of extendBatches(
    table,
    authority.publicKey,
    authority.publicKey,
    missing,
  )) {
    await sendV0(connection, authority, ixs);
  }
  return waitForLookupTable(
    connection,
    table,
    current.state.addresses.length + missing.length,
  );
}

export async function fetchLookupTable(
  connection: Connection,
  address: PublicKey,
): Promise<AddressLookupTableAccount> {
  const res = await connection.getAddressLookupTable(address, {
    commitment: "confirmed",
  });
  if (!res.value) {
    throw new Error(`lookup table ${address.toBase58()} not found`);
  }
  return res.value;
}

/** Waits until the table holds `count` addresses and the chain is past its last extension slot. */
export async function waitForLookupTable(
  connection: Connection,
  address: PublicKey,
  count: number,
  timeoutMs = 30_000,
): Promise<AddressLookupTableAccount> {
  const until = Date.now() + timeoutMs;
  for (;;) {
    const res = await connection.getAddressLookupTable(address, {
      commitment: "confirmed",
    });
    if (
      res.value &&
      res.value.state.addresses.length >= count &&
      (await connection.getSlot("confirmed")) > res.value.state.lastExtendedSlot
    ) {
      return res.value;
    }
    if (Date.now() > until) {
      throw new Error(
        `lookup table ${address.toBase58()} not ready after ${timeoutMs} ms`,
      );
    }
    await new Promise((r) => setTimeout(r, 400));
  }
}
