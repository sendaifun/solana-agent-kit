import { xchacha20poly1305 } from "@noble/ciphers/chacha";
// Memo encryption. Each note or allowance is encrypted to its recipient's
// viewing key (x25519), sealed with XChaCha20-Poly1305 under an ephemeral
// ECDH secret. Memo layout: ephemeralPub(32) | nonce(24) | ciphertext.
// An allowance memo packs one copy per reader: the agent, the owner and,
// when the allowance is pledged, the lender.
import { x25519 } from "@noble/curves/ed25519";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import {
  bytesToHex,
  bytesToUtf8,
  concatBytes,
  hexToBytes,
  randomBytes,
  utf8ToBytes,
} from "@noble/hashes/utils";
import type { Allowance, Note, Policy } from "./crypto.js";

export interface ViewingKey {
  secret: Uint8Array;
  pub: Uint8Array;
}

/** Deterministic viewing key from a spending key, so one secret backs up everything. */
export function viewingKeyFromSk(sk: bigint): ViewingKey {
  const secret = sha256(utf8ToBytes("stipend/viewing/" + sk.toString()));
  return { secret, pub: x25519.getPublicKey(secret) };
}

export function randomViewingKey(): ViewingKey {
  const secret = randomBytes(32);
  return { secret, pub: x25519.getPublicKey(secret) };
}

function sealKey(
  shared: Uint8Array,
  ephPub: Uint8Array,
  recipientPub: Uint8Array,
): Uint8Array {
  return hkdf(
    sha256,
    shared,
    concatBytes(ephPub, recipientPub),
    utf8ToBytes("stipend/memo/v1"),
    32,
  );
}

export function encryptMemo(
  recipientPub: Uint8Array,
  plaintext: Uint8Array,
): Uint8Array {
  const eph = randomBytes(32);
  const ephPub = x25519.getPublicKey(eph);
  const key = sealKey(
    x25519.getSharedSecret(eph, recipientPub),
    ephPub,
    recipientPub,
  );
  const nonce = randomBytes(24);
  const ct = xchacha20poly1305(key, nonce).encrypt(plaintext);
  return concatBytes(ephPub, nonce, ct);
}

/** Returns null if the memo is not for this key (wrong key or tampered). */
export function decryptMemo(
  vk: ViewingKey,
  memo: Uint8Array,
): Uint8Array | null {
  if (memo.length < 32 + 24 + 16) {
    return null;
  }
  const ephPub = memo.slice(0, 32);
  const nonce = memo.slice(32, 56);
  const ct = memo.slice(56);
  try {
    const key = sealKey(
      x25519.getSharedSecret(vk.secret, ephPub),
      ephPub,
      vk.pub,
    );
    return xchacha20poly1305(key, nonce).decrypt(ct);
  } catch {
    return null;
  }
}

// ---- JSON payloads with bigint fields ----

// bigints are tagged ("n:<hex>") so that ordinary hex strings such as viewing keys survive the round trip.
export function encodePayload(obj: Record<string, unknown>): Uint8Array {
  return utf8ToBytes(
    JSON.stringify(obj, (_, v) =>
      typeof v === "bigint" ? "n:" + v.toString(16) : v,
    ),
  );
}

export function decodePayload<T = Record<string, unknown>>(
  bytes: Uint8Array,
): T {
  return JSON.parse(bytesToUtf8(bytes), (_, v) =>
    typeof v === "string" && /^n:[0-9a-f]+$/.test(v)
      ? BigInt("0x" + v.slice(2))
      : v,
  );
}

export const toHex = (b: Uint8Array): string => "0x" + bytesToHex(b);
export const fromHex = (h: string): Uint8Array =>
  hexToBytes(h.startsWith("0x") ? h.slice(2) : h);

// ---- memo payloads ----

export type NotePayload = {
  t: "note";
  asset: bigint;
  amount: bigint;
  pk: bigint;
  blinding: bigint;
};

/** The viewing keys of an allowance's readers; every successor memo is written to both. */
export interface MemoViews {
  owner: Uint8Array;
  agent: Uint8Array;
}

/** The lender behind a pledged allowance: the preimage of `policy.lender` and the key its memos are written to. */
export interface LenderInfo {
  lenderAddr: bigint;
  loanRef: bigint;
  viewPub: Uint8Array;
}

export type AllowancePayload = {
  t: "allow";
  asset: bigint;
  remaining: bigint;
  agentPk: bigint;
  windowId: bigint;
  windowSpent: bigint;
  rho: bigint;
  pledgePaid: bigint;
  policy: Policy;
  ownerView: string;
  agentView: string;
  // present when the allowance is pledged
  lenderAddr?: bigint;
  loanRef?: bigint;
  lenderView?: string;
};

export function allowancePayload(
  a: Allowance,
  views: MemoViews,
  lender?: LenderInfo,
): AllowancePayload {
  const p: AllowancePayload = {
    t: "allow",
    ...a,
    ownerView: toHex(views.owner),
    agentView: toHex(views.agent),
  };
  if (lender) {
    Object.assign(p, {
      lenderAddr: lender.lenderAddr,
      loanRef: lender.loanRef,
      lenderView: toHex(lender.viewPub),
    });
  }
  return p;
}

export interface AllowanceRecord {
  allowance: Allowance;
  views: MemoViews;
  lender?: LenderInfo;
}

export function parseAllowancePayload(p: AllowancePayload): AllowanceRecord {
  const allowance: Allowance = {
    asset: p.asset,
    remaining: p.remaining,
    agentPk: p.agentPk,
    policy: p.policy,
    windowId: p.windowId,
    windowSpent: p.windowSpent,
    rho: p.rho,
    pledgePaid: p.pledgePaid ?? 0n,
  };
  const views: MemoViews = {
    owner: fromHex(p.ownerView),
    agent: fromHex(p.agentView),
  };
  const lender =
    p.lenderView !== undefined &&
    p.lenderAddr !== undefined &&
    p.loanRef !== undefined
      ? {
          lenderAddr: p.lenderAddr,
          loanRef: p.loanRef,
          viewPub: fromHex(p.lenderView),
        }
      : undefined;
  return { allowance, views, lender };
}

/** Several memos in one blob: len(2) | memo, repeated. */
export function packMemos(memos: Uint8Array[]): Uint8Array {
  const parts: number[] = [];
  for (const m of memos) {
    parts.push(m.length >> 8, m.length & 0xff, ...m);
  }
  return Uint8Array.from(parts);
}

export function unpackMemos(bytes: Uint8Array): Uint8Array[] {
  const out: Uint8Array[] = [];
  let i = 0;
  while (i + 2 <= bytes.length) {
    const len = (bytes[i] << 8) | bytes[i + 1];
    out.push(bytes.slice(i + 2, i + 2 + len));
    i += 2 + len;
  }
  return out;
}

export function noteMemo(note: Note, to: Uint8Array): Uint8Array {
  return encryptMemo(
    to,
    encodePayload({ t: "note", ...note } satisfies NotePayload),
  );
}

/** The on-chain memo of an allowance: a copy for the agent, one for the owner and one for the lender when pledged. */
export function allowanceMemo(
  a: Allowance,
  views: MemoViews,
  lender?: LenderInfo,
): Uint8Array {
  const payload = encodePayload(allowancePayload(a, views, lender));
  const copies = [
    encryptMemo(views.agent, payload),
    encryptMemo(views.owner, payload),
  ];
  if (lender) {
    copies.push(encryptMemo(lender.viewPub, payload));
  }
  return packMemos(copies);
}

/** What the borrower hands the lender (design 7): the full pledged note sealed to the lender's viewing key. */
export type LenderPayload = Uint8Array;

/**
 * The lender's copy of a pledged allowance: handed over off-chain after a pledge, and emitted as `LenderMemo` after
 * every spend. It carries both the owner's and the agent's view keys on purpose, so a claim can write the
 * successor memo to both of them.
 */
export function sealForLender(
  a: Allowance,
  views: MemoViews,
  lender: LenderInfo,
): LenderPayload {
  return encryptMemo(
    lender.viewPub,
    encodePayload(allowancePayload(a, views, lender)),
  );
}

/** Opens a lender copy; null when the memo is not for this key or is not a pledged allowance. */
export function openLenderMemo(
  vk: ViewingKey,
  memo: Uint8Array,
): (AllowanceRecord & { lender: LenderInfo }) | null {
  const pt = decryptMemo(vk, memo);
  if (!pt) {
    return null;
  }
  let payload: AllowancePayload;
  try {
    payload = decodePayload(pt);
  } catch {
    return null;
  }
  if (payload.t !== "allow") {
    return null;
  }
  const rec = parseAllowancePayload(payload);
  return rec.lender ? { ...rec, lender: rec.lender } : null;
}
