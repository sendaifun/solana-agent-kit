import { keccak_256 } from "@noble/hashes/sha3";
import { randomBytes } from "@noble/hashes/utils";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";
// Hashes, keys and commitments. Every function here mirrors a template in
// circuits/lib/hashes.circom; the circuit tests assert they agree.
import { buildPoseidon } from "circomlibjs";

export const FIELD =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;
export const AMOUNT_BITS = 128n;
export const MAX_AMOUNT = (1n << AMOUNT_BITS) - 1n;
/** Pledge fractions are in basis points of this. */
export const BPS = 10000n;

export const DOM = {
  PK: 1n,
  NK: 2n,
  NOTE: 3n,
  ALLOW: 4n,
  POLICY: 5n,
  NF: 6n,
  NFA: 7n,
  RHO: 8n,
  TOTAL: 9n,
  RCPT: 10n,
  ADDR: 11n,
  LENDER: 12n,
} as const;

type PoseidonFn = ((inputs: bigint[]) => Uint8Array) & {
  F: { toObject(x: Uint8Array): bigint };
};
let poseidonFn: PoseidonFn | undefined;

export async function initCrypto(): Promise<void> {
  if (!poseidonFn) {
    poseidonFn = (await buildPoseidon()) as unknown as PoseidonFn;
  }
}

export function poseidon(inputs: bigint[]): bigint {
  if (!poseidonFn) {
    throw new Error("call initCrypto() first");
  }
  return poseidonFn.F.toObject(poseidonFn(inputs));
}

export function randomField(): bigint {
  return BigInt("0x" + bytesToHex(randomBytes(31)));
}

export function mod(x: bigint): bigint {
  const r = x % FIELD;
  return r < 0n ? r + FIELD : r;
}

/** keccak256(utf8) reduced into the field; used for the empty leaf. */
export function fieldFromString(s: string): bigint {
  return BigInt("0x" + bytesToHex(keccak_256(utf8ToBytes(s)))) % FIELD;
}

export const ZERO_LEAF = fieldFromString("stipend");

export function assertAmount(x: bigint, what = "amount"): void {
  if (x < 0n || x > MAX_AMOUNT) {
    throw new Error(`${what} out of range`);
  }
}

// ---------- keys ----------

export interface SpendingKey {
  sk: bigint;
  pk: bigint;
  nk: bigint;
}

export function keysFromSk(sk: bigint): SpendingKey {
  return { sk, pk: poseidon([DOM.PK, sk]), nk: poseidon([DOM.NK, sk]) };
}

export function randomKeys(): SpendingKey {
  return keysFromSk(randomField());
}

// ---------- treasury notes ----------

export interface Note {
  asset: bigint;
  amount: bigint;
  pk: bigint;
  blinding: bigint;
}

export function noteCommitment(n: Note): bigint {
  return poseidon([DOM.NOTE, n.asset, n.amount, n.pk, n.blinding]);
}

export function noteNullifier(nk: bigint, commitment: bigint): bigint {
  return poseidon([DOM.NF, nk, commitment]);
}

// ---------- policies and allowances ----------

export interface Policy {
  lifetimeCap: bigint;
  windowCap: bigint; // 0 = unlimited
  windowLen: bigint; // seconds, must be > 0
  maxPerTx: bigint; // 0 = unlimited
  expiry: bigint; // unix seconds, 0 = never
  recipientRoot: bigint; // 0 = any recipient
  ownerPk: bigint;
  streamRate: bigint; // units per second released, 0 = no streaming
  streamStart: bigint; // unix seconds the stream starts
  lender: bigint; // lenderKey(lenderAddr, loanRef), 0 when unpledged
  pledgeBps: bigint; // 0..10000: fraction of every spend routed to the lender, 0 = unpledged
}

/** The lender's address and loan slot behind a policy's `lender` hash. */
export interface LenderRef {
  lenderAddr: bigint;
  loanRef: bigint;
}

export function policyHash(p: Policy): bigint {
  return poseidon([
    DOM.POLICY,
    p.lifetimeCap,
    p.windowCap,
    p.windowLen,
    p.maxPerTx,
    p.expiry,
    p.recipientRoot,
    p.ownerPk,
    p.streamRate,
    p.streamStart,
    p.lender,
    p.pledgeBps,
  ]);
}

export function lenderKey(lenderAddr: bigint, loanRef: bigint): bigint {
  return poseidon([DOM.LENDER, lenderAddr, loanRef]);
}

/** A lender ref the circuits accept: a non-zero 160-bit address and a 64-bit slot id, so every pledged note stays spendable. */
export function assertLenderRef(ref: LenderRef): void {
  if (ref.lenderAddr <= 0n || ref.lenderAddr >= 1n << 160n) {
    throw new Error("lenderAddr must be a non-zero address");
  }
  if (ref.loanRef < 0n || ref.loanRef >= 1n << 64n) {
    throw new Error("loanRef must fit 64 bits");
  }
}

export function assertPledge(p: Policy, ref?: LenderRef): void {
  if (p.pledgeBps < 0n || p.pledgeBps > BPS) {
    throw new Error("pledgeBps out of range");
  }
  if (p.pledgeBps === 0n) {
    if (p.lender !== 0n) {
      throw new Error("unpledged policy must have lender 0");
    }
    if (ref && (ref.lenderAddr !== 0n || ref.loanRef !== 0n)) {
      throw new Error("unpledged policy has no lender ref");
    }
  } else {
    if (!ref) {
      throw new Error(
        "pledged policy needs its lender ref (lenderAddr, loanRef)",
      );
    }
    assertLenderRef(ref);
    if (lenderKey(ref.lenderAddr, ref.loanRef) !== p.lender) {
      throw new Error("lender ref does not match the policy");
    }
  }
}

/** floor(amount * bps / 10000). */
export function shareOf(amount: bigint, bps: bigint): bigint {
  return (amount * bps) / BPS;
}

/** Units an allowance may still spend right now under its policy (lifetime, stream and window), ignoring per-tx caps. */
export function availableNow(a: Allowance, now: bigint): bigint {
  let avail = a.remaining;
  const p = a.policy;
  if (p.streamRate !== 0n) {
    const allotted =
      now > p.streamStart ? p.streamRate * (now - p.streamStart) : 0n;
    const spentSoFar = p.lifetimeCap - a.remaining;
    avail =
      allotted > spentSoFar
        ? allotted - spentSoFar < avail
          ? allotted - spentSoFar
          : avail
        : 0n;
  }
  if (p.windowCap !== 0n) {
    const carried = now / p.windowLen === a.windowId ? a.windowSpent : 0n;
    const left = p.windowCap > carried ? p.windowCap - carried : 0n;
    if (left < avail) {
      avail = left;
    }
  }
  return avail;
}

/** Value vested at `now`: min(lifetimeCap, streamRate * (now - streamStart)); the whole cap when unstreamed. */
export function vestedNow(a: Allowance, now: bigint): bigint {
  const p = a.policy;
  if (p.streamRate === 0n) {
    return p.lifetimeCap;
  }
  if (now <= p.streamStart) {
    return 0n;
  }
  const allotted = p.streamRate * (now - p.streamStart);
  return allotted < p.lifetimeCap ? allotted : p.lifetimeCap;
}

/** What the lender may still claim at `now`: its share of the vested value, less what was already routed, capped by the balance. */
export function lenderClaimable(a: Allowance, now: bigint): bigint {
  const owed = shareOf(vestedNow(a, now), a.policy.pledgeBps) - a.pledgePaid;
  const c = owed > 0n ? owed : 0n;
  return c < a.remaining ? c : a.remaining;
}

/** The lender's share of a gross spend of `amount`: floor(amount * bps / 10000), capped at the lender's remaining lifetime entitlement. */
export function lenderShare(a: Allowance, amount: bigint): bigint {
  const share = shareOf(amount, a.policy.pledgeBps);
  const headroom =
    shareOf(a.policy.lifetimeCap, a.policy.pledgeBps) - a.pledgePaid;
  if (headroom < 0n) {
    throw new Error("pledgePaid exceeds the lifetime share");
  }
  return share < headroom ? share : headroom;
}

export interface Allowance {
  asset: bigint;
  remaining: bigint;
  agentPk: bigint;
  policy: Policy;
  windowId: bigint;
  windowSpent: bigint;
  rho: bigint;
  pledgePaid: bigint; // cumulative value routed to the lender
}

export function allowanceCommitment(a: Allowance): bigint {
  return poseidon([
    DOM.ALLOW,
    a.asset,
    a.remaining,
    a.agentPk,
    policyHash(a.policy),
    a.windowId,
    a.windowSpent,
    a.rho,
    a.pledgePaid,
  ]);
}

export function allowanceNullifier(rho: bigint, commitment: bigint): bigint {
  return poseidon([DOM.NFA, rho, commitment]);
}

export function nextRho(rho: bigint): bigint {
  return poseidon([DOM.RHO, rho]);
}

export function totalCommitment(
  asset: bigint,
  total: bigint,
  salt: bigint,
): bigint {
  return poseidon([DOM.TOTAL, asset, total, salt]);
}

export function receiptCommitment(
  asset: bigint,
  amount: bigint,
  recipientKey: bigint,
  windowId: bigint,
  nullifier: bigint,
): bigint {
  return poseidon([DOM.RCPT, asset, amount, recipientKey, windowId, nullifier]);
}

export function addressKey(address: bigint): bigint {
  return poseidon([DOM.ADDR, address]);
}

export function addressToField(address: string): bigint {
  return BigInt(address);
}

/** How a gross spend of `amount` splits: what the lender gets and what the recipient gets. */
export interface SpendSplit {
  gross: bigint;
  lenderAmount: bigint;
  net: bigint;
}

export function splitSpend(
  a: Allowance,
  amount: bigint,
  claim = false,
): SpendSplit {
  const lenderAmount = claim ? amount : lenderShare(a, amount);
  return { gross: amount, lenderAmount, net: amount - lenderAmount };
}

/**
 * The successor of an allowance after a gross spend of `amount` at time `now`, as the circuit computes it.
 * `enforce` is true when the spender is the agent (the amount counts against the window); `claim` marks a
 * lender claim, which routes the whole amount to the lender and leaves the window state untouched.
 */
export function spendAllowance(
  a: Allowance,
  amount: bigint,
  now: bigint,
  enforce = true,
  claim = false,
): Allowance {
  const newWindowId = now / a.policy.windowLen;
  const carried = newWindowId === a.windowId ? a.windowSpent : 0n;
  const { lenderAmount } = splitSpend(a, amount, claim);
  return {
    ...a,
    remaining: a.remaining - amount,
    windowId: claim ? a.windowId : newWindowId,
    windowSpent: claim ? a.windowSpent : carried + (enforce ? amount : 0n),
    rho: nextRho(a.rho),
    pledgePaid: a.pledgePaid + lenderAmount,
  };
}
