// Builds circuit inputs (and the public values a contract call needs) from
// SDK objects. Pure functions: no I/O, no proving.
import {
  Allowance,
  BPS,
  LenderRef,
  Note,
  SpendingKey,
  addressKey,
  allowanceCommitment,
  allowanceNullifier,
  assertAmount,
  assertPledge,
  mod,
  nextRho,
  noteCommitment,
  noteNullifier,
  policyHash,
  randomField,
  receiptCommitment,
  shareOf,
  spendAllowance,
  splitSpend,
  totalCommitment,
  vestedNow,
} from "./crypto.js";
import { MerklePath, MerkleTree } from "./merkle.js";
import type { CircuitInput } from "./prover.js";

export const LEVELS = 20;
export const RECIPIENT_LEVELS = 8;
export const GRANT_OUTPUTS = 16;
export const DELEGATE_OUTPUTS = 4;

/** Public-input order of the spend circuit; the contract's input array must match. */
export const SPEND_PUBLIC = [
  "root",
  "nullifier",
  "newAllowanceCommitment",
  "payCommitment",
  "publicAmount",
  "publicRecipient",
  "publicAsset",
  "fee",
  "now",
  "receipt",
  "lenderAmount",
  "lenderAddr",
  "loanRef",
  "isLenderClaim",
  "extDataHash",
] as const;
/** Public-input order of the stream circuit. */
export const STREAM_PUBLIC = [
  "root",
  "minRemaining",
  "minRate",
  "lenderAddr",
  "loanRef",
  "pledgeBpsPub",
  "expiryPub",
  "lifetimeCapPub",
  "pledgePaidPub",
  "agentPk",
  "audience",
  "streamStartPub",
  "assetPub",
] as const;

const NO_LENDER: LenderRef = { lenderAddr: 0n, loanRef: 0n };

export interface NoteInput {
  note: Note;
  keys: SpendingKey;
  path: MerklePath;
}

/** A zero-amount note that satisfies the circuit without existing in the tree. */
export function dummyNoteInput(
  asset: bigint,
  keys: SpendingKey,
  tree: MerkleTree,
): NoteInput {
  return {
    note: { asset, amount: 0n, pk: keys.pk, blinding: randomField() },
    keys,
    path: tree.emptyPath(),
  };
}

/** floor(value * bps / 10000) and the remainder, as the circuits' ShareOf template takes them. */
function divBps(value: bigint, bps: bigint): { q: bigint; rem: bigint } {
  return { q: shareOf(value, bps), rem: (value * bps) % BPS };
}

// ---------------------------------------------------------------- transact

export interface TransactParams {
  root: bigint;
  asset: bigint;
  inputs: [NoteInput, NoteInput];
  outputs: [Note, Note];
  /** extAmount - fee: positive for deposits, negative for withdrawals, 0 for shielded transfers */
  publicAmount: bigint;
  extDataHash: bigint;
}

export function transactInput(p: TransactParams) {
  for (const i of p.inputs) {
    if (i.note.asset !== p.asset) {
      throw new Error("asset mismatch");
    }
  }
  for (const o of p.outputs) {
    assertAmount(o.amount);
    if (o.asset !== p.asset) {
      throw new Error("asset mismatch");
    }
  }
  const inputNullifier = p.inputs.map((i) =>
    noteNullifier(i.keys.nk, noteCommitment(i.note)),
  );
  const outputCommitment = p.outputs.map(noteCommitment);
  const publicAmount = mod(p.publicAmount);
  const publicAsset = publicAmount === 0n ? 0n : p.asset;
  const input: CircuitInput = {
    root: p.root,
    publicAmount,
    publicAsset,
    extDataHash: p.extDataHash,
    inputNullifier,
    outputCommitment,
    asset: p.asset,
    inAmount: p.inputs.map((i) => i.note.amount),
    inBlinding: p.inputs.map((i) => i.note.blinding),
    inSk: p.inputs.map((i) => i.keys.sk),
    inPathIndices: p.inputs.map((i) => i.path.pathIndices),
    inPathElements: p.inputs.map((i) => i.path.pathElements),
    outAmount: p.outputs.map((o) => o.amount),
    outPk: p.outputs.map((o) => o.pk),
    outBlinding: p.outputs.map((o) => o.blinding),
  };
  return { input, inputNullifier, outputCommitment, publicAmount, publicAsset };
}

// ---------------------------------------------------------------- grant

export interface GrantParams {
  root: bigint;
  asset: bigint;
  owner: SpendingKey;
  inputs: [NoteInput, NoteInput];
  /** up to GRANT_OUTPUTS allowances; missing slots are filled with zero-amount placeholders */
  allowances: Allowance[];
  /** lender refs, one per pledged allowance (same index); undefined for unpledged ones */
  lenders?: Array<LenderRef | undefined>;
  change: Note;
  totalSalt: bigint;
  extDataHash: bigint;
}

export function grantInput(p: GrantParams) {
  if (p.allowances.length > GRANT_OUTPUTS) {
    throw new Error(`at most ${GRANT_OUTPUTS} allowances per grant`);
  }
  const allowances = [...p.allowances];
  const lenders: LenderRef[] = allowances.map(
    (_a, i) => p.lenders?.[i] ?? NO_LENDER,
  );
  while (allowances.length < GRANT_OUTPUTS) {
    allowances.push({
      asset: p.asset,
      remaining: 0n,
      agentPk: randomField(),
      windowId: 0n,
      windowSpent: 0n,
      rho: randomField(),
      pledgePaid: 0n,
      policy: {
        lifetimeCap: 0n,
        windowCap: 0n,
        windowLen: 86400n,
        maxPerTx: 0n,
        expiry: 0n,
        recipientRoot: 0n,
        ownerPk: p.owner.pk,
        streamRate: 0n,
        streamStart: 0n,
        lender: 0n,
        pledgeBps: 0n,
      },
    });
    lenders.push(NO_LENDER);
  }
  allowances.forEach((a, i) => {
    if (a.asset !== p.asset) {
      throw new Error("asset mismatch");
    }
    if (
      a.policy.lifetimeCap !== a.remaining ||
      a.windowId !== 0n ||
      a.windowSpent !== 0n ||
      a.pledgePaid !== 0n
    ) {
      throw new Error("fresh allowance expected");
    }
    if (a.policy.ownerPk !== p.owner.pk) {
      throw new Error("policy owner must be the granter");
    }
    if (a.policy.windowLen === 0n) {
      throw new Error("windowLen must be > 0");
    }
    assertAmount(a.remaining);
    assertPledge(a.policy, lenders[i]);
  });
  const total = allowances.reduce((s, a) => s + a.remaining, 0n);
  const sumIn = p.inputs.reduce((s, i) => s + i.note.amount, 0n);
  if (sumIn !== total + p.change.amount) {
    throw new Error("inputs must equal allowances plus change");
  }

  const inputNullifier = p.inputs.map((i) =>
    noteNullifier(p.owner.nk, noteCommitment(i.note)),
  );
  const allowanceCommitments = allowances.map(allowanceCommitment);
  const changeCommitment = noteCommitment(p.change);
  const total_ = totalCommitment(p.asset, total, p.totalSalt);
  const input: CircuitInput = {
    root: p.root,
    inputNullifier,
    allowanceCommitment: allowanceCommitments,
    changeCommitment,
    totalCommitment: total_,
    extDataHash: p.extDataHash,
    asset: p.asset,
    sk: p.owner.sk,
    inAmount: p.inputs.map((i) => i.note.amount),
    inBlinding: p.inputs.map((i) => i.note.blinding),
    inPathIndices: p.inputs.map((i) => i.path.pathIndices),
    inPathElements: p.inputs.map((i) => i.path.pathElements),
    agentPk: allowances.map((a) => a.agentPk),
    amount: allowances.map((a) => a.remaining),
    windowCap: allowances.map((a) => a.policy.windowCap),
    windowLen: allowances.map((a) => a.policy.windowLen),
    maxPerTx: allowances.map((a) => a.policy.maxPerTx),
    expiry: allowances.map((a) => a.policy.expiry),
    recipientRoot: allowances.map((a) => a.policy.recipientRoot),
    streamRate: allowances.map((a) => a.policy.streamRate),
    streamStart: allowances.map((a) => a.policy.streamStart),
    lender: allowances.map((a) => a.policy.lender),
    pledgeBps: allowances.map((a) => a.policy.pledgeBps),
    lenderAddr: lenders.map((l) => l.lenderAddr),
    loanRef: lenders.map((l) => l.loanRef),
    rho: allowances.map((a) => a.rho),
    changeAmount: p.change.amount,
    changeBlinding: p.change.blinding,
    totalSalt: p.totalSalt,
  };
  return {
    input,
    allowances,
    inputNullifier,
    allowanceCommitments,
    changeCommitment,
    totalCommitment: total_,
    total,
  };
}

// ---------------------------------------------------------------- spend

export interface SpendParams {
  root: bigint;
  allowance: Allowance;
  path: MerklePath;
  /** the agent's key, or the owner's key to reclaim; omitted for a lender claim */
  spender?: SpendingKey;
  /** gross amount deducted from the allowance; the recipient gets it less the lender's share */
  amount: bigint;
  now: bigint;
  fee?: bigint;
  extDataHash: bigint;
  /** exactly one of these for an agent or owner spend; neither for a claim */
  shieldedTo?: { pk: bigint; blinding?: bigint };
  publicTo?: bigint; // recipient address as a field element
  /** Merkle path of the recipient key inside the policy's allow-list, when one is set */
  recipientPath?: MerklePath;
  /** required when the allowance is pledged: the preimage of policy.lender */
  lender?: LenderRef;
  /** lender claim: `amount` goes to the lender, nothing to anyone else; the contract checks msg.sender */
  claim?: boolean;
  /** vested value the claim is measured against; defaults to everything vested at `now` */
  vested?: bigint;
}

export function spendInput(p: SpendParams) {
  const a = p.allowance;
  const P = a.policy;
  const claim = p.claim === true;
  const lender = p.lender ?? NO_LENDER;
  assertPledge(P, P.pledgeBps === 0n ? undefined : lender);
  if (claim && P.pledgeBps === 0n) {
    throw new Error("only a pledged allowance can be claimed");
  }
  if (!claim && !p.spender) {
    throw new Error("spender required");
  }
  // The rules bind the agent's key, even when the owner granted to itself; the owner's key alone is free of them.
  const isAgent = !claim && p.spender!.pk === a.agentPk;
  const isPublic = p.publicTo !== undefined;
  if (claim) {
    if (isPublic || p.shieldedTo !== undefined) {
      throw new Error("a claim pays only the lender");
    }
  } else if (isPublic === (p.shieldedTo !== undefined)) {
    throw new Error("choose exactly one of shieldedTo / publicTo");
  }
  const fee = p.fee ?? 0n;
  assertAmount(p.amount);
  assertAmount(fee, "fee");
  if (!isPublic && fee !== 0n) {
    throw new Error("fees only on public payouts");
  }

  const split = splitSpend(a, p.amount, claim);
  if (fee > split.net) {
    throw new Error("fee exceeds the net amount");
  }
  const vested = claim ? (p.vested ?? vestedNow(a, p.now)) : 0n;
  const commitment = allowanceCommitment(a);
  const nullifier = allowanceNullifier(a.rho, commitment);
  const next = spendAllowance(a, p.amount, p.now, isAgent, claim);
  const newAllowanceCommitment = allowanceCommitment(next);
  const payBlinding = p.shieldedTo?.blinding ?? randomField();
  const recipientPk = p.shieldedTo?.pk ?? 0n;
  const publicRecipient = p.publicTo ?? 0n;
  const recipientKey = isPublic ? addressKey(publicRecipient) : recipientPk;
  const payNote: Note = {
    asset: a.asset,
    amount: split.net,
    pk: recipientPk,
    blinding: payBlinding,
  };
  const payCommitment = isPublic || claim ? 0n : noteCommitment(payNote);
  const receipt = receiptCommitment(
    a.asset,
    split.net,
    recipientKey,
    next.windowId,
    nullifier,
  );
  const rp = p.recipientPath ?? {
    pathElements: new Array(RECIPIENT_LEVELS).fill(0n),
    pathIndices: new Array(RECIPIENT_LEVELS).fill(0),
    root: 0n,
    index: -1,
  };
  const share = divBps(p.amount, P.pledgeBps);
  const lifetimeShare = divBps(P.lifetimeCap, P.pledgeBps);
  const owed = divBps(vested, P.pledgeBps);
  const publicAsset = isPublic || P.pledgeBps !== 0n ? a.asset : 0n;

  const input: CircuitInput = {
    root: p.root,
    nullifier,
    newAllowanceCommitment,
    payCommitment,
    publicAmount: isPublic ? split.net : 0n,
    publicRecipient,
    publicAsset,
    fee,
    now: p.now,
    receipt,
    lenderAmount: split.lenderAmount,
    lenderAddr: lender.lenderAddr,
    loanRef: lender.loanRef,
    isLenderClaim: claim ? 1n : 0n,
    extDataHash: p.extDataHash,
    asset: a.asset,
    remaining: a.remaining,
    agentPk: a.agentPk,
    windowId: a.windowId,
    windowSpent: a.windowSpent,
    rho: a.rho,
    pledgePaid: a.pledgePaid,
    lifetimeCap: P.lifetimeCap,
    windowCap: P.windowCap,
    windowLen: P.windowLen,
    maxPerTx: P.maxPerTx,
    expiry: P.expiry,
    recipientRoot: P.recipientRoot,
    ownerPk: P.ownerPk,
    streamRate: P.streamRate,
    streamStart: P.streamStart,
    lender: P.lender,
    pledgeBps: P.pledgeBps,
    sk: claim ? 0n : p.spender!.sk,
    pathIndices: p.path.pathIndices,
    pathElements: p.path.pathElements,
    amount: p.amount,
    isPublic: isPublic ? 1n : 0n,
    recipientPk,
    payBlinding,
    recipientPathIndices: rp.pathIndices,
    recipientPathElements: rp.pathElements,
    share: share.q,
    shareRem: share.rem,
    lifetimeShare: lifetimeShare.q,
    lifetimeShareRem: lifetimeShare.rem,
    vested,
    owedQ: owed.q,
    owedRem: owed.rem,
  };
  const publicSignals = SPEND_PUBLIC.map((k) => input[k] as bigint);
  return {
    input,
    publicSignals,
    nullifier,
    next,
    newAllowanceCommitment,
    payNote,
    payCommitment,
    receipt,
    isPublic,
    fee,
    lenderAmount: split.lenderAmount,
    net: split.net,
    publicAsset,
    claim,
  };
}

// ---------------------------------------------------------------- disclose

export type DisclosureKind =
  | "remainingAtLeast"
  | "spentAtMost"
  | "windowSpentAtMost";
const KIND: Record<DisclosureKind, bigint> = {
  remainingAtLeast: 0n,
  spentAtMost: 1n,
  windowSpentAtMost: 2n,
};

export interface DiscloseParams {
  root: bigint;
  allowance: Allowance;
  path: MerklePath;
  kind: DisclosureKind;
  bound: bigint;
  /** required for windowSpentAtMost; must equal the note's current window */
  windowId?: bigint;
  audience: bigint;
}

/** The private note fields every note-rebuilding circuit takes. */
function noteFields(a: Allowance): CircuitInput {
  const P = a.policy;
  return {
    asset: a.asset,
    remaining: a.remaining,
    windowId: a.windowId,
    windowSpent: a.windowSpent,
    rho: a.rho,
    pledgePaid: a.pledgePaid,
    lifetimeCap: P.lifetimeCap,
    windowCap: P.windowCap,
    windowLen: P.windowLen,
    maxPerTx: P.maxPerTx,
    expiry: P.expiry,
    recipientRoot: P.recipientRoot,
    ownerPk: P.ownerPk,
    streamRate: P.streamRate,
    streamStart: P.streamStart,
    lender: P.lender,
    pledgeBps: P.pledgeBps,
  };
}

export function discloseInput(p: DiscloseParams) {
  const a = p.allowance;
  const windowIdPub =
    p.kind === "windowSpentAtMost" ? (p.windowId ?? a.windowId) : 0n;
  const input: CircuitInput = {
    root: p.root,
    kind: KIND[p.kind],
    bound: p.bound,
    windowIdPub,
    agentPk: a.agentPk,
    audience: p.audience,
    ...noteFields(a),
    pathIndices: p.path.pathIndices,
    pathElements: p.path.pathElements,
  };
  const publicSignals = [
    p.root,
    KIND[p.kind],
    p.bound,
    windowIdPub,
    a.agentPk,
    p.audience,
  ];
  return { input, publicSignals, policyHash: policyHash(a.policy) };
}

// ---------------------------------------------------------------- stream

export interface StreamParams {
  root: bigint;
  allowance: Allowance;
  path: MerklePath;
  /** preimage of policy.lender */
  lender: LenderRef;
  minRemaining: bigint;
  minRate: bigint;
  audience: bigint;
}

/**
 * Inputs of the lender-facing stream proof: the note is pledged to `lender`, has at least `minRemaining` left and
 * streams at least `minRate`; the cap, expiry, what was routed, the stream start and the asset are disclosed.
 */
export function streamInput(p: StreamParams) {
  const a = p.allowance;
  const P = a.policy;
  if (P.pledgeBps === 0n) {
    throw new Error("allowance is not pledged");
  }
  assertPledge(P, p.lender);
  if (p.minRemaining > a.remaining) {
    throw new Error("minRemaining exceeds the balance");
  }
  if (p.minRate > P.streamRate) {
    throw new Error("minRate exceeds the stream rate");
  }
  const input: CircuitInput = {
    root: p.root,
    minRemaining: p.minRemaining,
    minRate: p.minRate,
    lenderAddr: p.lender.lenderAddr,
    loanRef: p.lender.loanRef,
    pledgeBpsPub: P.pledgeBps,
    expiryPub: P.expiry,
    lifetimeCapPub: P.lifetimeCap,
    pledgePaidPub: a.pledgePaid,
    agentPk: a.agentPk,
    audience: p.audience,
    streamStartPub: P.streamStart,
    assetPub: a.asset,
    ...noteFields(a),
    pathIndices: p.path.pathIndices,
    pathElements: p.path.pathElements,
  };
  const publicSignals = STREAM_PUBLIC.map((k) => input[k] as bigint);
  return { input, publicSignals };
}

// ---------------------------------------------------------------- delegate

export interface SubGrant {
  agentPk: bigint;
  amount: bigint;
  /** each defaults to the parent's value; must be no looser than the parent's */
  windowCap?: bigint;
  maxPerTx?: bigint;
  expiry?: bigint;
  streamRate?: bigint;
  streamStart?: bigint;
}

export interface DelegateParams {
  root: bigint;
  allowance: Allowance;
  path: MerklePath;
  agent: SpendingKey;
  subs: SubGrant[];
  now: bigint;
  /** window cap and stream rate the delegator keeps; the rest is shared out to the subs */
  residualWindowCap?: bigint;
  residualStreamRate?: bigint;
  /** preimage of the parent's policy.lender; required when the parent is pledged */
  lender?: LenderRef;
  extDataHash: bigint;
}

/**
 * Every sub and the residual carry the parent's pledge unchanged: only the owner creates a pledge (at grant),
 * so an agent cannot lend its allowance to itself and step around the owner's rules. A streamed sub starts
 * at `now` unless told otherwise, so a self-delegation restarts the stream; a lender reading the successor
 * memo should treat a later streamStart as a change of terms.
 */
export function delegateInput(p: DelegateParams) {
  const a = p.allowance;
  const P = a.policy;
  if (p.agent.pk !== a.agentPk) {
    throw new Error("only the agent can delegate");
  }
  if (p.subs.length === 0 || p.subs.length > DELEGATE_OUTPUTS) {
    throw new Error(`1..${DELEGATE_OUTPUTS} subs per delegation`);
  }
  const parentPledged = P.pledgeBps !== 0n;
  const parentLender = p.lender ?? NO_LENDER;
  assertPledge(P, parentPledged ? parentLender : undefined);
  const subs: Allowance[] = p.subs.map((s) => ({
    asset: a.asset,
    remaining: s.amount,
    agentPk: s.agentPk,
    windowId: a.windowId,
    windowSpent: 0n,
    rho: randomField(),
    pledgePaid: 0n,
    policy: {
      lifetimeCap: s.amount,
      windowCap: s.windowCap ?? P.windowCap,
      windowLen: P.windowLen,
      maxPerTx: s.maxPerTx ?? P.maxPerTx,
      expiry: s.expiry ?? P.expiry,
      recipientRoot: P.recipientRoot,
      ownerPk: P.ownerPk,
      streamRate: s.streamRate ?? P.streamRate,
      streamStart: s.streamStart ?? (P.streamRate !== 0n ? p.now : 0n),
      lender: P.lender,
      pledgeBps: P.pledgeBps,
    },
  }));
  // unused slots: zero amount, the tightest harmless policy, the parent's pledge
  while (subs.length < DELEGATE_OUTPUTS) {
    subs.push({
      asset: a.asset,
      remaining: 0n,
      agentPk: randomField(),
      windowId: a.windowId,
      windowSpent: 0n,
      rho: randomField(),
      pledgePaid: 0n,
      policy: {
        lifetimeCap: 0n,
        windowCap: P.windowCap === 0n ? 0n : 1n,
        windowLen: P.windowLen,
        maxPerTx: P.maxPerTx === 0n ? 0n : 1n,
        expiry: P.expiry,
        recipientRoot: P.recipientRoot,
        ownerPk: P.ownerPk,
        streamRate: P.streamRate === 0n ? 0n : 1n,
        streamStart: P.streamRate === 0n ? 0n : p.now,
        lender: P.lender,
        pledgeBps: P.pledgeBps,
      },
    });
  }
  const sumAmount = subs.reduce((s, x) => s + x.remaining, 0n);
  const sumCap = subs.reduce((s, x) => s + x.policy.windowCap, 0n);
  const sumRate = subs.reduce((s, x) => s + x.policy.streamRate, 0n);
  if (sumAmount > a.remaining) {
    throw new Error("subs exceed remaining");
  }
  const residualRemaining = a.remaining - sumAmount;
  const residualWindowCap =
    p.residualWindowCap ?? (P.windowCap === 0n ? 0n : P.windowCap - sumCap);
  const residualStreamRate =
    p.residualStreamRate ?? (P.streamRate === 0n ? 0n : P.streamRate - sumRate);
  if (
    P.windowCap !== 0n &&
    (residualWindowCap < 0n || residualWindowCap + sumCap > P.windowCap)
  ) {
    throw new Error("window caps exceed the parent");
  }
  if (
    P.streamRate !== 0n &&
    (residualStreamRate < 0n || residualStreamRate + sumRate > P.streamRate)
  ) {
    throw new Error("stream rates exceed the parent");
  }
  // an empty residual may drop its cap and rate; a live one keeps them
  if (
    residualRemaining !== 0n &&
    P.windowCap !== 0n &&
    residualWindowCap === 0n
  ) {
    throw new Error("residual needs a window cap");
  }
  if (
    residualRemaining !== 0n &&
    P.streamRate !== 0n &&
    residualStreamRate === 0n
  ) {
    throw new Error("residual needs a stream rate");
  }
  const resLifetimeCap = P.lifetimeCap - sumAmount;
  const resLifetimeShare = divBps(resLifetimeCap, P.pledgeBps);
  if (a.pledgePaid > resLifetimeShare.q) {
    throw new Error(
      "delegating that much would shrink the lender's share below what it was already paid",
    );
  }

  const commitment = allowanceCommitment(a);
  const nullifier = allowanceNullifier(a.rho, commitment);
  const residual: Allowance = {
    ...a,
    remaining: residualRemaining,
    rho: nextRho(a.rho),
    policy: {
      ...P,
      lifetimeCap: resLifetimeCap,
      windowCap: residualWindowCap,
      streamRate: residualStreamRate,
    },
  };
  const subCommitments = subs.map(allowanceCommitment);
  const residualCommitment = allowanceCommitment(residual);
  const input: CircuitInput = {
    root: p.root,
    nullifier,
    subCommitment: subCommitments,
    residualCommitment,
    now: p.now,
    extDataHash: p.extDataHash,
    asset: a.asset,
    remaining: a.remaining,
    agentPk: a.agentPk,
    windowId: a.windowId,
    windowSpent: a.windowSpent,
    rho: a.rho,
    pledgePaid: a.pledgePaid,
    lifetimeCap: P.lifetimeCap,
    windowCap: P.windowCap,
    windowLen: P.windowLen,
    maxPerTx: P.maxPerTx,
    expiry: P.expiry,
    recipientRoot: P.recipientRoot,
    ownerPk: P.ownerPk,
    streamRate: P.streamRate,
    streamStart: P.streamStart,
    lender: P.lender,
    pledgeBps: P.pledgeBps,
    lenderAddr: parentLender.lenderAddr,
    loanRef: parentLender.loanRef,
    sk: p.agent.sk,
    pathIndices: p.path.pathIndices,
    pathElements: p.path.pathElements,
    subAgentPk: subs.map((s) => s.agentPk),
    subAmount: subs.map((s) => s.remaining),
    subWindowCap: subs.map((s) => s.policy.windowCap),
    subMaxPerTx: subs.map((s) => s.policy.maxPerTx),
    subExpiry: subs.map((s) => s.policy.expiry),
    subStreamRate: subs.map((s) => s.policy.streamRate),
    subStreamStart: subs.map((s) => s.policy.streamStart),
    subRho: subs.map((s) => s.rho),
    resWindowCap: residualWindowCap,
    resStreamRate: residualStreamRate,
    resLifetimeShare: resLifetimeShare.q,
    resLifetimeShareRem: resLifetimeShare.rem,
  };
  return {
    input,
    nullifier,
    subs,
    residual,
    subCommitments,
    residualCommitment,
  };
}
