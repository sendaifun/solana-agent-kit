// Decoding stipend_pool events. The program emits them with Anchor's event-CPI: an inner instruction to
// itself whose data is EVENT_IX_TAG_LE (8) | sha256("event:<Name>")[0..8] | borsh fields.
import { sha256 } from "@noble/hashes/sha2";
import {
  type ConfirmedSignatureInfo,
  Connection,
  PublicKey,
  type VersionedTransactionResponse,
} from "@solana/web3.js";
import { fromBe } from "./field.js";

/** sha256("anchor:event")[0..8] as a little-endian u64 = 0x1d9acb512ea545e4. */
export const EVENT_IX_TAG_LE = Uint8Array.from([
  0xe4, 0x45, 0xa5, 0x2e, 0x51, 0xcb, 0x9a, 0x1d,
]);

export type PoolEvent =
  | {
      name: "NewCommitment";
      commitment: bigint;
      index: number;
      encryptedOutput: Uint8Array;
    }
  | { name: "NewNullifier"; nullifier: bigint }
  | { name: "NewGrant"; totalCommitment: bigint; firstIndex: number }
  | { name: "NewDelegation"; nullifier: bigint; firstIndex: number }
  | { name: "NewReceipt"; receipt: bigint }
  | {
      name: "PublicPayout";
      asset: PublicKey;
      recipient: PublicKey;
      tokenAccount: PublicKey;
      amount: bigint;
    }
  | {
      name: "PledgeRouted";
      lenderAddr: bigint;
      loanRef: bigint;
      asset: PublicKey;
      amount: bigint;
      nullifier: bigint;
      deliveredTo: PublicKey;
    }
  | {
      name: "PledgeEscrowed";
      lenderAddr: bigint;
      loanRef: bigint;
      asset: PublicKey;
      amount: bigint;
    }
  | {
      name: "LenderShareReleased";
      lenderAddr: bigint;
      loanRef: bigint;
      asset: PublicKey;
      amount: bigint;
      deliveredTo: PublicKey;
    }
  | { name: "LenderMemo"; loanRef: bigint; encryptedLender: Uint8Array };

export type PoolEventName = PoolEvent["name"];

/** An event with where it came from: the transaction, its slot and its position among the tx's events. */
export type LocatedEvent = PoolEvent & {
  signature: string;
  slot: number;
  seq: number;
};

const NAMES: PoolEventName[] = [
  "NewCommitment",
  "NewNullifier",
  "NewGrant",
  "NewDelegation",
  "NewReceipt",
  "PublicPayout",
  "PledgeRouted",
  "PledgeEscrowed",
  "LenderShareReleased",
  "LenderMemo",
];
const hex = (b: Uint8Array) => Buffer.from(b).toString("hex");
const BY_DISC = new Map(
  NAMES.map((n) => [
    hex(sha256(new TextEncoder().encode(`event:${n}`)).subarray(0, 8)),
    n,
  ]),
);

class Reader {
  o = 0;
  constructor(readonly b: Uint8Array) {}
  take(n: number) {
    if (this.o + n > this.b.length) {
      throw new Error("event truncated");
    }
    const s = this.b.subarray(this.o, this.o + n);
    this.o += n;
    return s;
  }
  fe() {
    return fromBe(this.take(32));
  }
  key() {
    return new PublicKey(this.take(32));
  }
  u32() {
    const s = this.take(4);
    return new DataView(s.buffer, s.byteOffset, 4).getUint32(0, true);
  }
  u64() {
    const s = this.take(8);
    return new DataView(s.buffer, s.byteOffset, 8).getBigUint64(0, true);
  }
  bytes() {
    return Uint8Array.from(this.take(this.u32()));
  }
}

/** Decodes one event-CPI instruction data blob; undefined if it is not a stipend_pool event. */
export function decodeEvent(data: Uint8Array): PoolEvent | undefined {
  if (data.length < 16 || hex(data.subarray(0, 8)) !== hex(EVENT_IX_TAG_LE)) {
    return undefined;
  }
  const name = BY_DISC.get(hex(data.subarray(8, 16)));
  if (!name) {
    return undefined;
  }
  const r = new Reader(data.subarray(16));
  switch (name) {
    case "NewCommitment":
      return {
        name,
        commitment: r.fe(),
        index: r.u32(),
        encryptedOutput: r.bytes(),
      };
    case "NewNullifier":
      return { name, nullifier: r.fe() };
    case "NewGrant":
      return { name, totalCommitment: r.fe(), firstIndex: r.u32() };
    case "NewDelegation":
      return { name, nullifier: r.fe(), firstIndex: r.u32() };
    case "NewReceipt":
      return { name, receipt: r.fe() };
    case "PublicPayout":
      return {
        name,
        asset: r.key(),
        recipient: r.key(),
        tokenAccount: r.key(),
        amount: r.u64(),
      };
    case "PledgeRouted":
      return {
        name,
        lenderAddr: r.fe(),
        loanRef: r.u64(),
        asset: r.key(),
        amount: r.u64(),
        nullifier: r.fe(),
        deliveredTo: r.key(),
      };
    case "PledgeEscrowed":
      return {
        name,
        lenderAddr: r.fe(),
        loanRef: r.u64(),
        asset: r.key(),
        amount: r.u64(),
      };
    case "LenderShareReleased":
      return {
        name,
        lenderAddr: r.fe(),
        loanRef: r.u64(),
        asset: r.key(),
        amount: r.u64(),
        deliveredTo: r.key(),
      };
    case "LenderMemo":
      return { name, loanRef: r.u64(), encryptedLender: r.bytes() };
  }
}

// ---- base58 (inner instruction data in JSON transaction responses) ----

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const B58_MAP = new Map([...B58].map((c, i) => [c, BigInt(i)]));

export function base58Decode(s: string): Uint8Array {
  let x = 0n;
  for (const c of s) {
    const v = B58_MAP.get(c);
    if (v === undefined) {
      throw new Error("bad base58");
    }
    x = x * 58n + v;
  }
  const bytes: number[] = [];
  while (x > 0n) {
    bytes.push(Number(x & 0xffn));
    x >>= 8n;
  }
  for (const c of s) {
    if (c === "1") {
      bytes.push(0);
    } else {
      break;
    }
  }
  return Uint8Array.from(bytes.reverse());
}

/** The pool events of one confirmed transaction, in emission order. Failed transactions have none. */
export function eventsOfTransaction(
  tx: VersionedTransactionResponse,
  programId: PublicKey,
): PoolEvent[] {
  if (!tx.meta || tx.meta.err) {
    return [];
  }
  const msg = tx.transaction.message;
  const keys = [
    ...msg.staticAccountKeys,
    ...(tx.meta.loadedAddresses?.writable ?? []),
    ...(tx.meta.loadedAddresses?.readonly ?? []),
  ];
  const out: PoolEvent[] = [];
  const inner = [...(tx.meta.innerInstructions ?? [])].sort(
    (a, b) => a.index - b.index,
  );
  for (const group of inner) {
    for (const ixn of group.instructions) {
      if (!keys[ixn.programIdIndex]?.equals(programId)) {
        continue;
      }
      const ev = decodeEvent(base58Decode(ixn.data));
      if (ev) {
        out.push(ev);
      }
    }
  }
  return out;
}

/**
 * Collects the pool's events from the chain incrementally, oldest first. It follows the transactions that
 * touch the Pool PDA, which every commitment-, nullifier- or pledge-emitting operation writes (buffer
 * uploads do not, so they are never fetched). `pull_lender_share` does not touch the pool: its
 * LenderShareReleased events are read from that transaction directly if needed. One instance can back
 * many wallets (they read `events`).
 */
export interface PoolEventLogOptions {
  /** Attempts per transaction when getTransaction returns null (a confirmed tx still propagating). Default 5. */
  fetchAttempts?: number;
  /** Delay between those attempts in ms. Default 400. */
  retryDelayMs?: number;
}

export class PoolEventLog {
  readonly events: LocatedEvent[] = [];
  readonly byTx = new Map<string, LocatedEvent[]>();
  private newest?: string;
  private inflight: Promise<number> = Promise.resolve(0);
  readonly address: PublicKey;
  private readonly fetchAttempts: number;
  private readonly retryDelayMs: number;

  constructor(
    readonly connection: Connection,
    readonly programId: PublicKey,
    opts: PoolEventLogOptions = {},
  ) {
    this.address = PublicKey.findProgramAddressSync(
      [new TextEncoder().encode("pool")],
      programId,
    )[0];
    this.fetchAttempts = Math.max(1, opts.fetchAttempts ?? 5);
    this.retryDelayMs = opts.retryDelayMs ?? 400;
  }

  /**
   * Fetches transactions newer than the last refresh; returns the number of new events. Progress is kept
   * per chunk of 25 transactions, oldest first: the cursor and the event list advance only after a whole
   * chunk was fetched and decoded, so a failed refresh (RPC error, a transaction not yet available) keeps
   * the chunks before it, loses nothing, and the next refresh resumes where it stopped. Concurrent calls
   * (many wallets share one log) run one after another.
   */
  refresh(): Promise<number> {
    const run = this.inflight.catch(() => 0).then(() => this.refreshOnce());
    this.inflight = run;
    return run;
  }

  private async fetchTx(
    signature: string,
  ): Promise<VersionedTransactionResponse> {
    for (let attempt = 1; ; attempt++) {
      const tx = await this.connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (tx) {
        return tx;
      }
      if (attempt >= this.fetchAttempts) {
        throw new Error(`transaction ${signature} not found`);
      }
      await new Promise((r) => setTimeout(r, this.retryDelayMs));
    }
  }

  private async refreshOnce(): Promise<number> {
    const sigs: ConfirmedSignatureInfo[] = [];
    let before: string | undefined;
    for (;;) {
      const page = await this.connection.getSignaturesForAddress(
        this.address,
        { before, until: this.newest, limit: 1000 },
        "confirmed",
      );
      sigs.push(...page);
      if (page.length < 1000) {
        break;
      }
      before = page[page.length - 1].signature;
    }
    if (sigs.length === 0) {
      return 0;
    }
    const ordered = sigs
      .filter((s) => !s.err && !this.byTx.has(s.signature))
      .reverse();
    let added = 0;
    for (let i = 0; i < ordered.length; i += 25) {
      const chunk = ordered.slice(i, i + 25);
      const txs = await Promise.all(
        chunk.map((s) => this.fetchTx(s.signature)),
      );
      const staged: Array<[string, LocatedEvent[]]> = [];
      txs.forEach((tx, j) => {
        const evs = eventsOfTransaction(tx, this.programId).map((e, seq) => ({
          ...e,
          signature: chunk[j].signature,
          slot: tx.slot,
          seq,
        }));
        if (evs.length > 0) {
          staged.push([chunk[j].signature, evs]);
        }
      });
      // commit the whole chunk (every older transaction is already in); nothing above touched the log
      for (const [sig, evs] of staged) {
        this.byTx.set(sig, evs);
        this.events.push(...evs);
        added += evs.length;
      }
      this.newest = chunk[chunk.length - 1].signature;
    }
    this.newest = sigs[0].signature;
    return added;
  }

  /**
   * The log as plain JSON (public chain data only, no secrets), so a client can cache it (IndexedDB, a file,
   * a same-origin snapshot) and `restore` it instead of rescanning the pool's whole history. Check what a
   * restored log produces against the chain (`SolanaWallet.matchesChain`) and drop the cache when it does
   * not match (a reset localnet reuses program ids).
   */
  snapshot(): PoolEventLogSnapshot {
    return {
      v: 1,
      programId: this.programId.toBase58(),
      newest: this.newest,
      events: this.events.map((e) =>
        Object.fromEntries(
          Object.entries(e).map(([k, v]) => [k, packValue(v)]),
        ),
      ),
    };
  }

  /**
   * Loads a `snapshot` into an empty log; the next refresh fetches only what is newer. Returns false and
   * loads nothing when the log is not empty or the snapshot is for another program or malformed.
   */
  restore(snap: PoolEventLogSnapshot): boolean {
    if (this.events.length > 0 || this.newest !== undefined) {
      return false;
    }
    try {
      if (
        snap?.v !== 1 ||
        snap.programId !== this.programId.toBase58() ||
        !Array.isArray(snap.events)
      ) {
        return false;
      }
      if (snap.newest !== undefined && typeof snap.newest !== "string") {
        return false;
      }
      if (snap.events.length > 0 && snap.newest === undefined) {
        return false;
      }
      const events = snap.events.map((raw) => {
        const e = Object.fromEntries(
          Object.entries(raw).map(([k, v]) => [k, unpackValue(v)]),
        ) as unknown as LocatedEvent;
        if (
          !NAMES.includes(e.name) ||
          typeof e.signature !== "string" ||
          typeof e.slot !== "number" ||
          typeof e.seq !== "number"
        ) {
          throw new Error("bad event");
        }
        return e;
      });
      for (const e of events) {
        const list = this.byTx.get(e.signature);
        if (list) {
          list.push(e);
        } else {
          this.byTx.set(e.signature, [e]);
        }
      }
      this.events.push(...events);
      this.newest = snap.newest;
      return true;
    } catch {
      this.events.length = 0;
      this.byTx.clear();
      this.newest = undefined;
      return false;
    }
  }
}

/** JSON form of a PoolEventLog (`PoolEventLog.snapshot`). Values: bigint "n:<decimal>", bytes "b:<hex>", keys "k:<base58>". */
export interface PoolEventLogSnapshot {
  v: 1;
  programId: string;
  newest?: string;
  events: Array<Record<string, string | number>>;
}

function packValue(v: unknown): string | number {
  if (typeof v === "bigint") {
    return `n:${v}`;
  }
  if (v instanceof Uint8Array) {
    return `b:${hex(v)}`;
  }
  if (v instanceof PublicKey) {
    return `k:${v.toBase58()}`;
  }
  if (typeof v === "string" || typeof v === "number") {
    return v;
  }
  throw new Error("unexpected event value");
}

function unpackValue(v: unknown): unknown {
  if (typeof v === "number") {
    return v;
  }
  if (typeof v !== "string") {
    throw new Error("bad snapshot value");
  }
  if (v.startsWith("n:")) {
    return BigInt(v.slice(2));
  }
  if (v.startsWith("b:")) {
    if (!/^(?:[0-9a-f]{2})*$/.test(v.slice(2))) {
      throw new Error("bad hex");
    }
    return Uint8Array.from(Buffer.from(v.slice(2), "hex"));
  }
  if (v.startsWith("k:")) {
    return new PublicKey(v.slice(2));
  }
  return v;
}
