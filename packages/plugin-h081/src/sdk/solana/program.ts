// Instruction builders and account decoders for the stipend_pool program (Anchor wire format:
// 8-byte discriminator sha256("global:<name>")[0..8] followed by borsh arguments).
import { sha256 } from "@noble/hashes/sha2";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { be32, concatBytes, fromBe, u16le, u32le, u64le } from "./field.js";
import { assetCapPda, bufferPda, configPda, poolPda } from "./pda.js";

/** Localnet program ids (from solana/keys/, declared in programs/stipend_pool/src/lib.rs). */
export const LOCALNET_POOL_PROGRAM_ID = new PublicKey(
  "AzES8Vd7NmoxdSrEBbwDNAwn2pyoAz5m5w7bmVas5Si3",
);
/** Localnet-only build with `probe_insert` (feature merkle-probe). Never deployed anywhere else. */
export const LOCALNET_PROBE_PROGRAM_ID = new PublicKey(
  "FWV9zZmHQoXE1M16eNcCTmzwVKft8RbS5zFUZ1od4hDR",
);

export const CIRCUIT_ID = {
  transact: 0,
  grant: 1,
  spend: 2,
  disclose: 3,
  delegate: 4,
  stream: 5,
} as const;
export type CircuitId = keyof typeof CIRCUIT_ID;

/** Anchor custom error codes of stipend_pool (6000 + variant index). */
export const POOL_ERROR = {
  PublicInputCount: 6000,
  InputNotInField: 6001,
  Bn254Syscall: 6002,
  InvalidProofEncoding: 6003,
  InvalidProof: 6004,
  PoseidonSyscall: 6005,
  TreeFull: 6006,
  UnknownRoot: 6007,
  UnknownCircuit: 6008,
  BufferLength: 6009,
  BufferBounds: 6010,
  BufferPayload: 6011,
  ExtData: 6012,
  SameNullifier: 6013,
  PublicAmount: 6014,
  AssetMustBeHidden: 6015,
  AssetRequired: 6016,
  MissingAccount: 6017,
  AlreadySpent: 6018,
  NullifierAccount: 6019,
  StaleTimestamp: 6020,
  Recipient: 6021,
  Lender: 6022,
  AmountOverflow: 6023,
  WrongMint: 6024,
  WrongTokenAccount: 6025,
  WrongVault: 6026,
  WrongEscrow: 6027,
  NothingOwed: 6028,
  DepositShortfall: 6029,
  FeeExceedsAmount: 6030,
  WrongTokenProgram: 6031,
  BufferAuthority: 6032,
  AccountInUse: 6033,
  LenderAccount: 6034,
  DepositsPaused: 6035,
  DepositTooLarge: 6036,
  DepositCapExceeded: 6037,
  ConfigAuthority: 6038,
  WrongAssetCap: 6039,
  UpgradeAuthority: 6040,
  PoolComplete: 6041,
  PoolAccount: 6042,
} as const;

export const LEVELS = 20;
/**
 * Committed roots the pool keeps: one per state-changing operation (not per leaf), so a proof stays valid for
 * the next ROOT_HISTORY - 1 operations. (The EVM reference kept 128, one per leaf.)
 */
export const ROOT_HISTORY = 1024;
/** Full size of the ["pool"] account: discriminator | next_index | current_root_index | [20][32] | [1024][32]. */
export const POOL_SIZE = 8 + 4 + 4 + 32 * LEVELS + 32 * ROOT_HISTORY;
/** `initialize` creates the pool account at this size (CPI creation limit); `grow_pool` adds 10 KiB per call. */
export const POOL_INIT_LEN = Math.min(POOL_SIZE, 10_240);
export const POOL_GROW_STEP = 10_240;
/** grow_pool calls that bring a pool account of `len` bytes to POOL_SIZE. */
export const poolGrowsNeeded = (len: number) =>
  Math.max(0, Math.ceil((POOL_SIZE - len) / POOL_GROW_STEP));
/** The BPF upgradeable loader, owner of every upgradeable program and its ProgramData account. */
export const BPF_LOADER_UPGRADEABLE_ID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111",
);
/** ProgramData account of an upgradeable program (holds its upgrade authority). */
export const programDataAddress = (programId: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [programId.toBytes()],
    BPF_LOADER_UPGRADEABLE_ID,
  )[0];
export const BUFFER_HEADER = 8 + 32 + 8 + 4 + 1;
/** A buffer is created with up to this many payload bytes (CPI account creation is capped at 10 KiB)... */
export const BUFFER_MAX_INIT = 10_240 - BUFFER_HEADER;
/** ...and grows by 10 KiB per buffer_grow up to this. */
export const BUFFER_MAX_LEN = 96 * 1024;
export const BUFFER_GROW_STEP = 10_240;

export const disc = (name: string) =>
  sha256(new TextEncoder().encode(`global:${name}`)).subarray(0, 8);
export const ix = (
  programId: PublicKey,
  name: string,
  keys: TransactionInstruction["keys"],
  ...args: Uint8Array[]
) =>
  new TransactionInstruction({
    programId,
    keys,
    data: Buffer.from(concatBytes(disc(name), ...args)),
  });
export const w = (pubkey: PublicKey, isSigner = false) => ({
  pubkey,
  isSigner,
  isWritable: true,
});
export const r = (pubkey: PublicKey, isSigner = false) => ({
  pubkey,
  isSigner,
  isWritable: false,
});

/** Grows a buffer by up to 10 KiB toward its declared length. */
export function bufferGrowIx(
  programId: PublicKey,
  authority: PublicKey,
  seed: bigint,
): TransactionInstruction {
  return ix(
    programId,
    "buffer_grow",
    [
      w(bufferPda(programId, authority, seed)),
      w(authority, true),
      r(SystemProgram.programId),
    ],
    u64le(seed),
  );
}

export const U64_MAX = (1n << 64n) - 1n;

/** Deposit guard set at `initialize`: config authority and the caps every new vault starts with. */
export interface DepositGuard {
  /** Can change caps and pause deposits (never withdrawals). Default: the payer. */
  authority?: PublicKey;
  /** Largest vault balance a deposit may lead to, per asset (base units). Default: u64 max (no cap). */
  maxTotal?: bigint;
  /** Largest single deposit, per asset (base units). Default: u64 max (no cap). */
  maxPerDeposit?: bigint;
}

/**
 * `initialize` alone: creates the pool account at POOL_INIT_LEN and the config. `payer` must be the program's
 * upgrade authority. Use initializePoolIxs, which adds the grow_pool calls that complete the pool.
 */
export function initializeIx(
  programId: PublicKey,
  payer: PublicKey,
  guard: DepositGuard = {},
): TransactionInstruction {
  return ix(
    programId,
    "initialize",
    [
      w(poolPda(programId)),
      w(payer, true),
      r(SystemProgram.programId),
      w(configPda(programId)),
      r(programDataAddress(programId)),
    ],
    (guard.authority ?? payer).toBytes(),
    u64le(guard.maxTotal ?? U64_MAX),
    u64le(guard.maxPerDeposit ?? U64_MAX),
  );
}

/** Grows the pool account by 10 KiB toward POOL_SIZE (the last call writes the empty tree). Permissionless. */
export function growPoolIx(
  programId: PublicKey,
  payer: PublicKey,
): TransactionInstruction {
  return ix(programId, "grow_pool", [
    w(poolPda(programId)),
    w(payer, true),
    r(SystemProgram.programId),
  ]);
}

/** initialize + the grow_pool calls that complete the pool: one transaction. `payer` = upgrade authority. */
export function initializePoolIxs(
  programId: PublicKey,
  payer: PublicKey,
  guard: DepositGuard = {},
): TransactionInstruction[] {
  return [
    initializeIx(programId, payer, guard),
    ...Array.from({ length: poolGrowsNeeded(POOL_INIT_LEN) }, () =>
      growPoolIx(programId, payer),
    ),
  ];
}

/** Config authority only: one asset's caps. */
export function setAssetCapsIx(
  programId: PublicKey,
  authority: PublicKey,
  mint: PublicKey,
  maxTotal: bigint,
  maxPerDeposit: bigint,
): TransactionInstruction {
  return ix(
    programId,
    "set_asset_caps",
    [
      r(configPda(programId)),
      r(authority, true),
      w(assetCapPda(programId, mint)),
    ],
    u64le(maxTotal),
    u64le(maxPerDeposit),
  );
}

/** Config authority only: the caps future vaults start with. */
export function setDefaultCapsIx(
  programId: PublicKey,
  authority: PublicKey,
  maxTotal: bigint,
  maxPerDeposit: bigint,
): TransactionInstruction {
  return ix(
    programId,
    "set_default_caps",
    [w(configPda(programId)), r(authority, true)],
    u64le(maxTotal),
    u64le(maxPerDeposit),
  );
}

/** Config authority only: pause or resume deposits. Withdrawals are never affected. */
export function setDepositsPausedIx(
  programId: PublicKey,
  authority: PublicKey,
  paused: boolean,
): TransactionInstruction {
  return ix(
    programId,
    "set_deposits_paused",
    [w(configPda(programId)), r(authority, true)],
    Uint8Array.of(paused ? 1 : 0),
  );
}

/** Config authority only: hand over (PublicKey.default renounces). */
export function setConfigAuthorityIx(
  programId: PublicKey,
  authority: PublicKey,
  newAuthority: PublicKey,
): TransactionInstruction {
  return ix(
    programId,
    "set_config_authority",
    [w(configPda(programId)), r(authority, true)],
    newAuthority.toBytes(),
  );
}

export interface PoolConfig {
  authority: PublicKey;
  depositsPaused: boolean;
  defaultMaxTotal: bigint;
  defaultMaxPerDeposit: bigint;
}
export interface AssetCaps {
  mint: PublicKey;
  maxTotal: bigint;
  maxPerDeposit: bigint;
}
const readU64 = (d: Uint8Array, o: number) =>
  new DataView(d.buffer, d.byteOffset + o, 8).getBigUint64(0, true);

/** Decodes the ["config"] account (after the 8-byte discriminator). */
export function decodeConfig(data: Uint8Array): PoolConfig {
  return {
    authority: new PublicKey(data.subarray(8, 40)),
    depositsPaused: data[40] === 1,
    defaultMaxTotal: readU64(data, 41),
    defaultMaxPerDeposit: readU64(data, 49),
  };
}

/** Decodes a ["cap", mint] account. */
export function decodeAssetCaps(data: Uint8Array): AssetCaps {
  return {
    mint: new PublicKey(data.subarray(8, 40)),
    maxTotal: readU64(data, 40),
    maxPerDeposit: readU64(data, 48),
  };
}

export function bufferOpenIx(
  programId: PublicKey,
  authority: PublicKey,
  seed: bigint,
  len: number,
): TransactionInstruction {
  return ix(
    programId,
    "buffer_open",
    [
      w(bufferPda(programId, authority, seed)),
      w(authority, true),
      r(SystemProgram.programId),
    ],
    u64le(seed),
    u32le(len),
  );
}

export function bufferWriteIx(
  programId: PublicKey,
  authority: PublicKey,
  seed: bigint,
  offset: number,
  bytes: Uint8Array,
): TransactionInstruction {
  return ix(
    programId,
    "buffer_write",
    [w(bufferPda(programId, authority, seed)), r(authority, true)],
    u64le(seed),
    u32le(offset),
    u32le(bytes.length),
    bytes,
  );
}

export function bufferCloseIx(
  programId: PublicKey,
  authority: PublicKey,
  seed: bigint,
): TransactionInstruction {
  return ix(
    programId,
    "buffer_close",
    [w(bufferPda(programId, authority, seed)), w(authority, true)],
    u64le(seed),
  );
}

/** Stateless proof check; the buffer holds borsh (Proof, Vec<[u8; 32]>). */
export function verifyProofIx(
  programId: PublicKey,
  buffer: PublicKey,
  circuit: CircuitId,
): TransactionInstruction {
  return ix(
    programId,
    "verify_proof",
    [r(buffer)],
    Uint8Array.of(CIRCUIT_ID[circuit]),
  );
}

/** Known root + disclose proof; the buffer holds borsh (Proof, DiscloseArgs). */
export function verifyDisclosureIx(
  programId: PublicKey,
  buffer: PublicKey,
): TransactionInstruction {
  return ix(programId, "verify_disclosure", [r(poolPda(programId)), r(buffer)]);
}

/** Known root + stream proof; the buffer holds borsh (Proof, StreamArgs). */
export function verifyStreamIx(
  programId: PublicKey,
  buffer: PublicKey,
): TransactionInstruction {
  return ix(programId, "verify_stream", [r(poolPda(programId)), r(buffer)]);
}

/** Probe build only: append raw leaves; one root for the call (as operations do) or, with commitEach, one per leaf. */
export function probeInsertIx(
  programId: PublicKey,
  leaves: bigint[],
  commitEach = false,
): TransactionInstruction {
  return ix(
    programId,
    "probe_insert",
    [w(poolPda(programId))],
    u32le(leaves.length),
    ...leaves.map(be32),
    Uint8Array.of(commitEach ? 1 : 0),
  );
}

// ------------------------------------------------------------- payload encoders

export interface DiscloseArgs {
  root: bigint;
  kind: bigint;
  bound: bigint;
  windowId: bigint;
  agentPk: bigint;
  audience: bigint;
}

/** borsh DiscloseArgs: six 32-byte big-endian field elements, in circuit order. */
export function encodeDiscloseArgs(a: DiscloseArgs): Uint8Array {
  return concatBytes(
    ...[a.root, a.kind, a.bound, a.windowId, a.agentPk, a.audience].map(be32),
  );
}

export interface StreamArgs {
  root: bigint;
  minRemaining: bigint;
  minRate: bigint;
  lender: PublicKey;
  loanRef: bigint;
  pledgeBps: number;
  expiry: bigint;
  lifetimeCap: bigint;
  pledgePaid: bigint;
  agentPk: bigint;
  audience: bigint;
  streamStart: bigint;
  asset: PublicKey;
}

/** borsh StreamArgs (lender and asset as pubkeys; the program maps them with fieldOf). */
export function encodeStreamArgs(a: StreamArgs): Uint8Array {
  return concatBytes(
    be32(a.root),
    be32(a.minRemaining),
    be32(a.minRate),
    a.lender.toBytes(),
    u64le(a.loanRef),
    u16le(a.pledgeBps),
    u64le(a.expiry),
    be32(a.lifetimeCap),
    be32(a.pledgePaid),
    be32(a.agentPk),
    be32(a.audience),
    u64le(a.streamStart),
    a.asset.toBytes(),
  );
}

// ------------------------------------------------------------- account decoders

/** Anchor account discriminator of Pool: sha256("account:Pool")[0..8]. */
export const POOL_DISCRIMINATOR = sha256(
  new TextEncoder().encode("account:Pool"),
).subarray(0, 8);

/** Whether a ["pool"] account is full size and carries the Pool discriminator (grow_pool finished). */
export function isPoolComplete(data: Uint8Array): boolean {
  return (
    data.length === POOL_SIZE &&
    POOL_DISCRIMINATOR.every((b, i) => data[i] === b)
  );
}

export interface PoolState {
  nextIndex: number;
  currentRootIndex: number;
  filledSubtrees: bigint[];
  roots: bigint[];
  lastRoot: bigint;
}

/** Decodes the zero-copy Pool account (discriminator | u32 | u32 | [20][32] | [1024][32]). Throws on a pool that is not complete. */
export function decodePool(data: Uint8Array): PoolState {
  if (!isPoolComplete(data)) {
    throw new Error(
      `pool account is not complete (${data.length} of ${POOL_SIZE} bytes); finish it with grow_pool`,
    );
  }
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const nextIndex = dv.getUint32(8, true);
  const currentRootIndex = dv.getUint32(12, true);
  const at = (o: number) => fromBe(data.subarray(o, o + 32));
  const filledSubtrees = Array.from({ length: LEVELS }, (_, i) =>
    at(16 + 32 * i),
  );
  const roots = Array.from({ length: ROOT_HISTORY }, (_, i) =>
    at(16 + 32 * LEVELS + 32 * i),
  );
  return {
    nextIndex,
    currentRootIndex,
    filledSubtrees,
    roots,
    lastRoot: roots[currentRootIndex],
  };
}
