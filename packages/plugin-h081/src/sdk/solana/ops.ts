// Payload encoders and instruction builders of the stipend_pool operations (transact, grant, spend,
// delegate, pull_lender_share, create_vault). Payloads are borsh `(Proof, Args, ExtData)` staged in a
// Buffer; extDataHash = keccak256(borsh(ext)) mod r (docs/SOLANA-PORT.md section 2).
import { keccak_256 } from "@noble/hashes/sha3";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { FIELD_R, be32, concatBytes, fromBe, u32le, u64le } from "./field.js";
import {
  assetCapPda,
  configPda,
  escrowPda,
  eventAuthorityPda,
  nullifierPda,
  poolPda,
  vaultAuthorityPda,
  vaultPda,
} from "./pda.js";
import { ix, r, w } from "./program.js";

export const DEFAULT_PUBKEY = PublicKey.default;
export const GRANT_OUTPUTS = 16;
export const DELEGATE_OUTPUTS = 4;

// ------------------------------------------------------------------ borsh helpers

export function u128le(x: bigint): Uint8Array {
  if (x < 0n || x >= 1n << 128n) {
    throw new Error("u128 out of range");
  }
  const out = new Uint8Array(16);
  let v = x;
  for (let i = 0; i < 16; i++) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

export function i128le(x: bigint): Uint8Array {
  if (x < -(1n << 127n) || x >= 1n << 127n) {
    throw new Error("i128 out of range");
  }
  return u128le(BigInt.asUintN(128, x));
}

/** borsh Vec<u8>: u32 LE length + bytes. */
export function vecU8(b: Uint8Array): Uint8Array {
  return concatBytes(u32le(b.length), b);
}

const bool = (b: boolean) => Uint8Array.of(b ? 1 : 0);
const key = (k: PublicKey) => k.toBytes();

/** extDataHash = keccak256(borsh(ext)) mod r. */
export function extDataHash(extBytes: Uint8Array): bigint {
  return fromBe(keccak_256(extBytes)) % FIELD_R;
}

// ------------------------------------------------------------------ transact

export interface TransactArgs {
  root: bigint;
  publicAmount: bigint;
  extDataHash: bigint;
  inputNullifiers: [bigint, bigint];
  outputCommitments: [bigint, bigint];
}
/** `recipient` and `feeRecipient` are token accounts (PublicKey.default when unused). */
export interface TransactExt {
  recipient: PublicKey;
  relayer: PublicKey;
  feeRecipient: PublicKey;
  extAmount: bigint;
  fee: bigint;
  encryptedOutputs: [Uint8Array, Uint8Array];
}

export function encodeTransactArgs(a: TransactArgs): Uint8Array {
  return concatBytes(
    be32(a.root),
    be32(a.publicAmount),
    be32(a.extDataHash),
    ...a.inputNullifiers.map(be32),
    ...a.outputCommitments.map(be32),
  );
}
export function encodeTransactExt(e: TransactExt): Uint8Array {
  return concatBytes(
    key(e.recipient),
    key(e.relayer),
    key(e.feeRecipient),
    i128le(e.extAmount),
    u128le(e.fee),
    ...e.encryptedOutputs.map(vecU8),
  );
}

// ------------------------------------------------------------------ grant

export interface GrantArgs {
  root: bigint;
  inputNullifiers: [bigint, bigint];
  allowanceCommitments: bigint[];
  changeCommitment: bigint;
  totalCommitment: bigint;
  extDataHash: bigint;
}
export interface GrantExt {
  encryptedAllowances: Uint8Array[];
  encryptedChange: Uint8Array;
}

export function encodeGrantArgs(a: GrantArgs): Uint8Array {
  if (a.allowanceCommitments.length !== GRANT_OUTPUTS) {
    throw new Error(`${GRANT_OUTPUTS} allowance commitments expected`);
  }
  return concatBytes(
    be32(a.root),
    ...a.inputNullifiers.map(be32),
    ...a.allowanceCommitments.map(be32),
    be32(a.changeCommitment),
    be32(a.totalCommitment),
    be32(a.extDataHash),
  );
}
export function encodeGrantExt(e: GrantExt): Uint8Array {
  if (e.encryptedAllowances.length !== GRANT_OUTPUTS) {
    throw new Error(`${GRANT_OUTPUTS} allowance memos expected`);
  }
  return concatBytes(
    ...e.encryptedAllowances.map(vecU8),
    vecU8(e.encryptedChange),
  );
}

// ------------------------------------------------------------------ spend

/**
 * Spend public inputs as the program takes them. publicRecipient (the wallet owning the payout token
 * account) and publicAsset (the mint) are pubkeys the program maps with fieldOf (PublicKey.default = 0);
 * lenderAddr is the circuit's lender field.
 */
export interface SpendArgs {
  root: bigint;
  nullifier: bigint;
  newAllowanceCommitment: bigint;
  payCommitment: bigint;
  publicAmount: bigint;
  publicRecipient: PublicKey;
  publicAsset: PublicKey;
  fee: bigint;
  timestamp: bigint;
  receipt: bigint;
  lenderAmount: bigint;
  lenderAddr: bigint;
  loanRef: bigint;
  isLenderClaim: boolean;
  extDataHash: bigint;
}
export interface SpendExt {
  relayer: PublicKey;
  feeRecipient: PublicKey;
  encryptedAllowance: Uint8Array;
  encryptedPayment: Uint8Array;
  encryptedLender: Uint8Array;
}

export function encodeSpendArgs(a: SpendArgs): Uint8Array {
  return concatBytes(
    be32(a.root),
    be32(a.nullifier),
    be32(a.newAllowanceCommitment),
    be32(a.payCommitment),
    u128le(a.publicAmount),
    key(a.publicRecipient),
    key(a.publicAsset),
    u128le(a.fee),
    u64le(a.timestamp),
    be32(a.receipt),
    u128le(a.lenderAmount),
    be32(a.lenderAddr),
    u64le(a.loanRef),
    bool(a.isLenderClaim),
    be32(a.extDataHash),
  );
}
export function encodeSpendExt(e: SpendExt): Uint8Array {
  return concatBytes(
    key(e.relayer),
    key(e.feeRecipient),
    vecU8(e.encryptedAllowance),
    vecU8(e.encryptedPayment),
    vecU8(e.encryptedLender),
  );
}
/** Byte offset of SpendArgs.root inside a spend payload (after the 256-byte proof). */
export const SPEND_ROOT_OFFSET = 256;

// ------------------------------------------------------------------ delegate

export interface DelegateArgs {
  root: bigint;
  nullifier: bigint;
  subCommitments: bigint[];
  residualCommitment: bigint;
  timestamp: bigint;
  extDataHash: bigint;
}
export interface DelegateExt {
  encryptedSubs: Uint8Array[];
  encryptedResidual: Uint8Array;
}

export function encodeDelegateArgs(a: DelegateArgs): Uint8Array {
  if (a.subCommitments.length !== DELEGATE_OUTPUTS) {
    throw new Error(`${DELEGATE_OUTPUTS} sub commitments expected`);
  }
  return concatBytes(
    be32(a.root),
    be32(a.nullifier),
    ...a.subCommitments.map(be32),
    be32(a.residualCommitment),
    u64le(a.timestamp),
    be32(a.extDataHash),
  );
}
export function encodeDelegateExt(e: DelegateExt): Uint8Array {
  if (e.encryptedSubs.length !== DELEGATE_OUTPUTS) {
    throw new Error(`${DELEGATE_OUTPUTS} sub memos expected`);
  }
  return concatBytes(...e.encryptedSubs.map(vecU8), vecU8(e.encryptedResidual));
}

// ------------------------------------------------------------------ instructions

/** An optional Anchor account: the program id stands for "none". */
const opt = (
  programId: PublicKey,
  k: PublicKey | undefined,
  writable: boolean,
  signer = false,
) =>
  k
    ? { pubkey: k, isSigner: signer, isWritable: writable }
    : { pubkey: programId, isSigner: false, isWritable: false };
const eventAccounts = (programId: PublicKey) => [
  r(eventAuthorityPda(programId)),
  r(programId),
];

export function createVaultIx(
  programId: PublicKey,
  payer: PublicKey,
  mint: PublicKey,
  tokenProgram: PublicKey,
): TransactionInstruction {
  return ix(programId, "create_vault", [
    w(payer, true),
    r(mint),
    r(vaultAuthorityPda(programId)),
    w(vaultPda(programId, mint)),
    r(tokenProgram),
    r(SystemProgram.programId),
    r(configPda(programId)),
    w(assetCapPda(programId, mint)),
  ]);
}

export interface TokenAccounts {
  mint: PublicKey;
  tokenProgram: PublicKey;
}

export interface TransactAccounts {
  payer: PublicKey;
  buffer: PublicKey;
  nullifiers: [bigint, bigint];
  /** required when tokens move */
  token?: TokenAccounts;
  depositorToken?: PublicKey;
  recipientToken?: PublicKey;
  feeToken?: PublicKey;
}

export function transactIx(
  programId: PublicKey,
  a: TransactAccounts,
): TransactionInstruction {
  return ix(programId, "transact", [
    w(a.payer, true),
    w(poolPda(programId)),
    w(a.buffer),
    w(nullifierPda(programId, a.nullifiers[0])),
    w(nullifierPda(programId, a.nullifiers[1])),
    r(vaultAuthorityPda(programId)),
    opt(programId, a.token?.mint, false),
    opt(
      programId,
      a.token ? vaultPda(programId, a.token.mint) : undefined,
      true,
    ),
    opt(programId, a.depositorToken, true),
    opt(programId, a.recipientToken, true),
    opt(programId, a.feeToken, true),
    opt(programId, a.token?.tokenProgram, false),
    r(SystemProgram.programId),
    // deposit guard: the config always, the asset's caps on a deposit
    r(configPda(programId)),
    opt(
      programId,
      a.token && a.depositorToken
        ? assetCapPda(programId, a.token.mint)
        : undefined,
      false,
    ),
    ...eventAccounts(programId),
  ]);
}

export function grantIx(
  programId: PublicKey,
  payer: PublicKey,
  buffer: PublicKey,
  nullifiers: [bigint, bigint],
): TransactionInstruction {
  return ix(programId, "grant", [
    w(payer, true),
    w(poolPda(programId)),
    w(buffer),
    w(nullifierPda(programId, nullifiers[0])),
    w(nullifierPda(programId, nullifiers[1])),
    r(SystemProgram.programId),
    ...eventAccounts(programId),
  ]);
}

export interface SpendAccounts {
  payer: PublicKey;
  buffer: PublicKey;
  nullifier: bigint;
  token?: TokenAccounts;
  recipientToken?: PublicKey;
  feeToken?: PublicKey;
  lenderToken?: PublicKey;
  /** escrow for the lender leg: pass { lenderAddr, loanRef } whenever a lender share is paid */
  escrow?: { lenderAddr: bigint; loanRef: bigint };
  lenderSigner?: PublicKey;
}

export function spendIx(
  programId: PublicKey,
  a: SpendAccounts,
): TransactionInstruction {
  const escrow =
    a.escrow && a.token
      ? escrowPda(
          programId,
          a.token.mint,
          a.escrow.lenderAddr,
          a.escrow.loanRef,
        )
      : undefined;
  return ix(programId, "spend", [
    w(a.payer, true),
    w(poolPda(programId)),
    w(a.buffer),
    w(nullifierPda(programId, a.nullifier)),
    r(vaultAuthorityPda(programId)),
    opt(programId, a.token?.mint, false),
    opt(
      programId,
      a.token ? vaultPda(programId, a.token.mint) : undefined,
      true,
    ),
    opt(programId, a.recipientToken, true),
    opt(programId, a.feeToken, true),
    opt(programId, a.lenderToken, true),
    opt(programId, escrow, true),
    opt(programId, a.lenderSigner, false, true),
    opt(programId, a.token?.tokenProgram, false),
    r(SystemProgram.programId),
    ...eventAccounts(programId),
  ]);
}

export function delegateIx(
  programId: PublicKey,
  payer: PublicKey,
  buffer: PublicKey,
  nullifier: bigint,
): TransactionInstruction {
  return ix(programId, "delegate", [
    w(payer, true),
    w(poolPda(programId)),
    w(buffer),
    w(nullifierPda(programId, nullifier)),
    r(SystemProgram.programId),
    ...eventAccounts(programId),
  ]);
}

export function pullLenderShareIx(
  programId: PublicKey,
  mint: PublicKey,
  tokenProgram: PublicKey,
  lenderAddr: bigint,
  loanRef: bigint,
  lenderToken: PublicKey,
): TransactionInstruction {
  return ix(
    programId,
    "pull_lender_share",
    [
      r(mint),
      r(vaultAuthorityPda(programId)),
      w(escrowPda(programId, mint, lenderAddr, loanRef)),
      w(lenderToken),
      r(tokenProgram),
      ...eventAccounts(programId),
    ],
    be32(lenderAddr),
    u64le(loanRef),
  );
}
