// Phase 2 staking SDK (docs/SOLANA-PORT.md section 3.3): SPL Token / Token-2022 helpers, and
// instruction builders + account decoders for the capacity_stake and safety_pool programs.
// Wire format: Anchor (8-byte discriminator sha256("global:<name>")[0..8] + borsh args;
// accounts start with sha256("account:<Name>")[0..8]). Mints are always parameters; nothing is hard-coded.
//
// CAVEATS (docs/tokenomics.md, restated): safety_pool pays a shortfall in the pool's token valued 1:1
// in base units (a 6-decimal USDG shortfall of 1,000,000 pays 1,000,000 base units of H081) and ignores
// the H081 price. With lender-chosen premiums a lender can fund a loan to itself, let it lapse past the
// grace period and slash the pool for the principal (self-lend). Until premiums are priced or cover is
// underwritten, only stakers who trust the set of insurable lenders should deposit.
import { sha256 } from "@noble/hashes/sha2";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { be32, concatBytes, fieldOf, u64le } from "./field.js";

// ------------------------------------------------------------- program ids

export const CLASSIC_TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const TOKEN22_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);
export const ATA_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

/** Localnet ids (solana/keys/, declared in programs/<name>/src/lib.rs). */
export const LOCALNET_CAPACITY_STAKE_PROGRAM_ID = new PublicKey(
  "6yzLZPu3JcLQHZQqLKWpGnHUpNTGAkoRcW8Ji8oSgCd3",
);
export const LOCALNET_SAFETY_POOL_PROGRAM_ID = new PublicKey(
  "EvKjwxVQX1RhyoBXisdbzk1JGLb5fMgZzHVLQAiPKJwe",
);
/** Localnet-only test builds (feature `fast`): cooldowns of 3 s, grace of 2 s. Never deployed. */
export const LOCALNET_CAPACITY_STAKE_FAST_PROGRAM_ID = new PublicKey(
  "DoiRuuwMkN8M4CWQy45Lne2wGP7JCPUtPDiC1pE9QM1q",
);
export const LOCALNET_SAFETY_POOL_FAST_PROGRAM_ID = new PublicKey(
  "5K2L3eNBzmeznEZpY4vav74UHRaBHgQJv582W5i4kT7",
);
/** stream_loan program whose Slot accounts safety_pool reads (STREAM_LOAN_ID in stream_loan_view.rs). */
export const SAFETY_STREAM_LOAN_PROGRAM_ID = new PublicKey(
  "FvM9Xczax1TCU15imjdNAMg8JXP4apSs2pn9LWCdjyPc",
);
/** stipend_pool program whose escrow accounts safety_pool reads (POOL_PROGRAM_ID in stream_loan_view.rs). */
export const SAFETY_POOL_ESCROW_PROGRAM_ID = new PublicKey(
  "AzES8Vd7NmoxdSrEBbwDNAwn2pyoAz5m5w7bmVas5Si3",
);

// ------------------------------------------------------------- constants (mirror the programs)

export const DESK_WHOLE_TOKENS = 100n;
export const SHIELD_WHOLE_TOKENS = 100n;
/** USDG base units (6 decimals) per 30 days per shielding unit: 10,000 USDG. */
export const SHIELD_PER_UNIT = 10_000_000_000n;
/** capacity_stake COOLDOWN: one full relayer capacity window (30 days). */
export const CAPACITY_COOLDOWN = 30n * 86400n;
export const SAFETY_COOLDOWN = 14n * 86400n;
export const STREAM_GRACE = 7n * 86400n;

/** Anchor error codes (6000 + variant index). */
export const CAPACITY_ERROR = {
  Amount: 6000,
  MoreThanStaked: 6001,
  NothingPending: 6002,
  Cooldown: 6003,
  NotEmpty: 6004,
  Decimals: 6005,
  Overflow: 6006,
  UpgradeAuthority: 6007,
  ConfigAuthority: 6008,
  StakingPaused: 6009,
  StakeCap: 6010,
} as const;
export const SAFETY_ERROR = {
  Amount: 6000,
  TooSmall: 6001,
  Shares: 6002,
  MoreThanHeld: 6003,
  NothingUnbonding: 6004,
  Cooldown: 6005,
  NotTheLender: 6006,
  NoLoan: 6007,
  Settled: 6008,
  NoDueDate: 6009,
  Expired: 6010,
  AlreadyPaid: 6011,
  NoShortfall: 6012,
  PoolEmpty: 6013,
  BadLoanAccount: 6014,
  WrongPool: 6015,
  NotEmpty: 6016,
  Overflow: 6017,
  NoShares: 6018,
  LaunchWallet: 6019,
  UpgradeAuthority: 6020,
  ConfigAuthority: 6021,
  DepositsPaused: 6022,
  DepositCap: 6023,
  NotInsurable: 6024,
  CoverTooLarge: 6025,
  PremiumTooLow: 6026,
  ExposureCap: 6027,
  TooShort: 6028,
  Released: 6029,
  NotReleasable: 6030,
  TopUpTooLarge: 6031,
} as const;

/** The BPF upgradeable loader's ProgramData address of a program (init instructions check its upgrade authority). */
export const programDataPda = (programId: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [programId.toBytes()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111"),
  )[0];

// ------------------------------------------------------------- encoding helpers

const enc = (s: string) => new TextEncoder().encode(s);
const ixDisc = (name: string) => sha256(enc(`global:${name}`)).subarray(0, 8);
/** Anchor account discriminator sha256("account:<Name>")[0..8]. */
export const accountDiscriminator = (name: string) =>
  sha256(enc(`account:${name}`)).subarray(0, 8);
const anchorIx = (
  programId: PublicKey,
  name: string,
  keys: TransactionInstruction["keys"],
  ...args: Uint8Array[]
) =>
  new TransactionInstruction({
    programId,
    keys,
    data: Buffer.from(concatBytes(ixDisc(name), ...args)),
  });
const w = (pubkey: PublicKey, isSigner = false) => ({
  pubkey,
  isSigner,
  isWritable: true,
});
const r = (pubkey: PublicKey, isSigner = false) => ({
  pubkey,
  isSigner,
  isWritable: false,
});
const pda = (programId: PublicKey, ...seeds: Uint8Array[]) =>
  PublicKey.findProgramAddressSync(seeds, programId)[0];

export function u128le(x: bigint): Uint8Array {
  const out = new Uint8Array(16);
  const dv = new DataView(out.buffer);
  dv.setBigUint64(0, x & ((1n << 64n) - 1n), true);
  dv.setBigUint64(8, x >> 64n, true);
  return out;
}

class Reader {
  private o = 8; // after the discriminator
  private dv: DataView;
  constructor(
    private d: Uint8Array,
    name?: string,
  ) {
    this.dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
    if (name) {
      const want = accountDiscriminator(name);
      if (!want.every((b, i) => d[i] === b)) {
        throw new Error(`not a ${name} account`);
      }
    }
  }
  key() {
    const k = new PublicKey(this.d.subarray(this.o, this.o + 32));
    this.o += 32;
    return k;
  }
  u8() {
    return this.d[this.o++];
  }
  bool() {
    return this.u8() !== 0;
  }
  u16() {
    const v = this.dv.getUint16(this.o, true);
    this.o += 2;
    return v;
  }
  u64() {
    const v = this.dv.getBigUint64(this.o, true);
    this.o += 8;
    return v;
  }
  i64() {
    const v = this.dv.getBigInt64(this.o, true);
    this.o += 8;
    return v;
  }
  u128() {
    const lo = this.u64();
    const hi = this.u64();
    return lo | (hi << 64n);
  }
  bytes(n: number) {
    const v = this.d.slice(this.o, this.o + n);
    this.o += n;
    return v;
  }
}

// ------------------------------------------------------------- SPL Token / Token-2022

export function ataAddress(
  owner: PublicKey,
  mint: PublicKey,
  tokenProgram = TOKEN22_PROGRAM_ID,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBytes(), tokenProgram.toBytes(), mint.toBytes()],
    ATA_PROGRAM_ID,
  )[0];
}

/** Creates the ATA if missing (idempotent). Works for PDAs as owners too. */
export function createAtaIdempotentIx(
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: ATA_PROGRAM_ID,
    keys: [
      w(payer, true),
      w(ataAddress(owner, mint, tokenProgram)),
      r(owner),
      r(mint),
      r(SystemProgram.programId),
      r(tokenProgram),
    ],
    data: Buffer.from([1]),
  });
}

export function mintToIx(
  mint: PublicKey,
  dest: PublicKey,
  authority: PublicKey,
  amount: bigint,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: tokenProgram,
    keys: [w(mint), w(dest), r(authority, true)],
    data: Buffer.from(concatBytes(Uint8Array.of(7), u64le(amount))),
  });
}

export function transferCheckedIx(
  source: PublicKey,
  mint: PublicKey,
  dest: PublicKey,
  owner: PublicKey,
  amount: bigint,
  decimals: number,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: tokenProgram,
    keys: [w(source), r(mint), w(dest), r(owner, true)],
    data: Buffer.from(
      concatBytes(Uint8Array.of(12), u64le(amount), Uint8Array.of(decimals)),
    ),
  });
}

export interface CreateMintOptions {
  decimals?: number;
  tokenProgram?: PublicKey;
  /** Token-2022 only: add a TransferFeeConfig extension with this fee (basis points, maximum fee). */
  transferFee?: { bps: number; max: bigint };
}

/**
 * Instructions that create and initialize a local test mint (Token-2022 by default, 6 decimals like H081)
 * with `authority` as mint authority and no freeze authority. `mint` must sign the transaction.
 */
export async function createMintIxs(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  authority: PublicKey,
  opts: CreateMintOptions = {},
): Promise<TransactionInstruction[]> {
  const decimals = opts.decimals ?? 6;
  const tokenProgram = opts.tokenProgram ?? TOKEN22_PROGRAM_ID;
  if (opts.transferFee && !tokenProgram.equals(TOKEN22_PROGRAM_ID)) {
    throw new Error("transfer fees need Token-2022");
  }
  // base mint 82 bytes; with extensions: padded to 165, account type byte, then TLV (2 type + 2 len + 108)
  const space = opts.transferFee ? 166 + 4 + 108 : 82;
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  const ixs = [
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint,
      lamports,
      space,
      programId: tokenProgram,
    }),
  ];
  if (opts.transferFee) {
    const fee = new Uint8Array(2);
    new DataView(fee.buffer).setUint16(0, opts.transferFee.bps, true);
    // TransferFeeExtension(26) / InitializeTransferFeeConfig(0): config authority, withdraw authority (COption), bps u16, max u64
    ixs.push(
      new TransactionInstruction({
        programId: tokenProgram,
        keys: [w(mint)],
        data: Buffer.from(
          concatBytes(
            Uint8Array.of(26, 0),
            Uint8Array.of(1),
            authority.toBytes(),
            Uint8Array.of(1),
            authority.toBytes(),
            fee,
            u64le(opts.transferFee.max),
          ),
        ),
      }),
    );
  }
  // InitializeMint2(20): decimals, mint authority, freeze authority None
  ixs.push(
    new TransactionInstruction({
      programId: tokenProgram,
      keys: [w(mint)],
      data: Buffer.from(
        concatBytes(
          Uint8Array.of(20, decimals),
          authority.toBytes(),
          Uint8Array.of(0),
        ),
      ),
    }),
  );
  return ixs;
}

/** Amount of a token account (works for SPL Token and Token-2022, with or without extensions). */
export async function tokenBalance(
  connection: Connection,
  account: PublicKey,
): Promise<bigint> {
  const info = await connection.getAccountInfo(account, "confirmed");
  if (!info) {
    return 0n;
  }
  return new DataView(
    info.data.buffer,
    info.data.byteOffset,
    info.data.byteLength,
  ).getBigUint64(64, true);
}

// ------------------------------------------------------------- capacity_stake

/** Per-mint config: ["config", mint]. */
export const capacityConfigPda = (programId: PublicKey, mint: PublicKey) =>
  pda(programId, enc("config"), mint.toBytes());
/** Vault token account (authority = config): ["vault", mint]. */
export const capacityVaultPda = (programId: PublicKey, mint: PublicKey) =>
  pda(programId, enc("vault"), mint.toBytes());
/** One owner's stake: ["stake", mint, owner]. */
export const stakePda = (
  programId: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
) => pda(programId, enc("stake"), mint.toBytes(), owner.toBytes());

/** Staking caps of a new config: total staked and per stake (base units of the mint). */
export interface StakeCaps {
  authority: PublicKey;
  maxTotal: bigint;
  maxPerStake: bigint;
}

/** Only the program's upgrade authority may sign as `payer`; it names the config authority and the staking caps. */
export function capacityInitConfigIx(
  programId: PublicKey,
  payer: PublicKey,
  mint: PublicKey,
  caps: StakeCaps,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(
    programId,
    "init_config",
    [
      w(capacityConfigPda(programId, mint)),
      r(mint),
      w(capacityVaultPda(programId, mint)),
      w(payer, true),
      r(tokenProgram),
      r(SystemProgram.programId),
      r(programDataPda(programId)),
    ],
    caps.authority.toBytes(),
    u64le(caps.maxTotal),
    u64le(caps.maxPerStake),
  );
}

/** Config authority: staking caps. */
export function setStakeCapsIx(
  programId: PublicKey,
  authority: PublicKey,
  mint: PublicKey,
  maxTotal: bigint,
  maxPerStake: bigint,
): TransactionInstruction {
  return anchorIx(
    programId,
    "set_stake_caps",
    [w(capacityConfigPda(programId, mint)), r(authority, true)],
    u64le(maxTotal),
    u64le(maxPerStake),
  );
}

/** Config authority: pause or resume staking (never unstaking). */
export function setStakingPausedIx(
  programId: PublicKey,
  authority: PublicKey,
  mint: PublicKey,
  paused: boolean,
): TransactionInstruction {
  return anchorIx(
    programId,
    "set_staking_paused",
    [w(capacityConfigPda(programId, mint)), r(authority, true)],
    Uint8Array.of(paused ? 1 : 0),
  );
}

/** Config authority: hand the capacity_stake config authority over. */
export function capacitySetConfigAuthorityIx(
  programId: PublicKey,
  authority: PublicKey,
  mint: PublicKey,
  next: PublicKey,
): TransactionInstruction {
  return anchorIx(
    programId,
    "set_config_authority",
    [w(capacityConfigPda(programId, mint)), r(authority, true)],
    next.toBytes(),
  );
}

export function stakeIx(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  from: PublicKey,
  amount: bigint,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(
    programId,
    "stake",
    [
      w(capacityConfigPda(programId, mint)),
      w(stakePda(programId, mint, owner)),
      r(mint),
      w(capacityVaultPda(programId, mint)),
      w(from),
      w(owner, true),
      r(tokenProgram),
      r(SystemProgram.programId),
    ],
    u64le(amount),
  );
}

export function requestUnstakeIx(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  amount: bigint,
): TransactionInstruction {
  return anchorIx(
    programId,
    "request_unstake",
    [
      w(capacityConfigPda(programId, mint)),
      w(stakePda(programId, mint, owner)),
      r(owner, true),
    ],
    u64le(amount),
  );
}

export function unstakeIx(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  to: PublicKey,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(programId, "unstake", [
    w(capacityConfigPda(programId, mint)),
    w(stakePda(programId, mint, owner)),
    r(mint),
    w(capacityVaultPda(programId, mint)),
    w(to),
    r(owner, true),
    r(tokenProgram),
  ]);
}

export function closeStakeIx(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
): TransactionInstruction {
  return anchorIx(programId, "close_stake", [
    w(stakePda(programId, mint, owner)),
    w(owner, true),
  ]);
}

/** View: return data is borsh Capacity { desks u64, shield_cap u128 }. */
export function capacityViewIx(
  programId: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
): TransactionInstruction {
  return anchorIx(programId, "capacity", [
    r(capacityConfigPda(programId, mint)),
    r(stakePda(programId, mint, owner)),
  ]);
}

export interface CapacityConfig {
  mint: PublicKey;
  tokenProgram: PublicKey;
  vault: PublicKey;
  decimals: number;
  deskUnit: bigint;
  shieldUnit: bigint;
  totalStaked: bigint;
  totalPending: bigint;
  bump: number;
  vaultBump: number;
  authority: PublicKey;
  stakingPaused: boolean;
  maxTotal: bigint;
  maxPerStake: bigint;
}
export function decodeCapacityConfig(data: Uint8Array): CapacityConfig {
  const rd = new Reader(data, "Config");
  return {
    mint: rd.key(),
    tokenProgram: rd.key(),
    vault: rd.key(),
    decimals: rd.u8(),
    deskUnit: rd.u64(),
    shieldUnit: rd.u64(),
    totalStaked: rd.u64(),
    totalPending: rd.u64(),
    bump: rd.u8(),
    vaultBump: rd.u8(),
    authority: rd.key(),
    stakingPaused: rd.bool(),
    maxTotal: rd.u64(),
    maxPerStake: rd.u64(),
  };
}

export interface StakeAccount {
  owner: PublicKey;
  mint: PublicKey;
  staked: bigint;
  pending: bigint;
  readyAt: bigint;
  bump: number;
}
export function decodeStake(data: Uint8Array): StakeAccount {
  const rd = new Reader(data, "Stake");
  return {
    owner: rd.key(),
    mint: rd.key(),
    staked: rd.u64(),
    pending: rd.u64(),
    readyAt: rd.i64(),
    bump: rd.u8(),
  };
}

export interface Capacity {
  desks: bigint;
  shieldCap: bigint;
}
/** Same rule as the program: desks = staked / deskUnit; shieldCap = (staked / shieldUnit) * SHIELD_PER_UNIT. */
export function capacityOf(
  cfg: Pick<CapacityConfig, "deskUnit" | "shieldUnit">,
  staked: bigint,
): Capacity {
  return {
    desks: staked / cfg.deskUnit,
    shieldCap: (staked / cfg.shieldUnit) * SHIELD_PER_UNIT,
  };
}
export function decodeCapacity(raw: Uint8Array): Capacity {
  const ret = padTo(raw, 24);
  const dv = new DataView(ret.buffer, ret.byteOffset, ret.byteLength);
  return {
    desks: dv.getBigUint64(0, true),
    shieldCap: dv.getBigUint64(8, true) | (dv.getBigUint64(16, true) << 64n),
  };
}

/** Reads an owner's stake and capacity off chain state (what relayers enforce). Zeros if no stake account. */
export async function readCapacity(
  connection: Connection,
  programId: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
) {
  const [cfgInfo, stakeInfo] = await connection.getMultipleAccountsInfo(
    [capacityConfigPda(programId, mint), stakePda(programId, mint, owner)],
    "confirmed",
  );
  if (!cfgInfo) {
    throw new Error("capacity_stake config not initialized for this mint");
  }
  const cfg = decodeCapacityConfig(cfgInfo.data);
  const stake = stakeInfo
    ? decodeStake(stakeInfo.data)
    : { owner, mint, staked: 0n, pending: 0n, readyAt: 0n, bump: 0 };
  return { config: cfg, stake, ...capacityOf(cfg, stake.staked) };
}

// ------------------------------------------------------------- safety_pool

/** Per-mint pool: ["safety", mint]. */
export const safetyConfigPda = (programId: PublicKey, mint: PublicKey) =>
  pda(programId, enc("safety"), mint.toBytes());
/** Vault token account (authority = pool config): ["vault", mint]. */
export const safetyVaultPda = (programId: PublicKey, mint: PublicKey) =>
  pda(programId, enc("vault"), mint.toBytes());
/** A staker's position: ["position", mint, owner]. */
export const positionPda = (
  programId: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
) => pda(programId, enc("position"), mint.toBytes(), owner.toBytes());
/** Cover of one loan (one per loan ref across all mints): ["cover", loan_ref u64 LE]. */
export const coverPda = (programId: PublicKey, loanRef: bigint) =>
  pda(programId, enc("cover"), u64le(loanRef));
/** stream_loan Slot: ["slot", loan_ref u64 LE] under the stream_loan program. */
export const streamSlotPda = (
  loanRef: bigint,
  streamLoan = SAFETY_STREAM_LOAN_PROGRAM_ID,
) => pda(streamLoan, enc("slot"), u64le(loanRef));
/** stream_loan Ledger: ["ledger", loan_ref u64 LE, mint]. */
export const streamLedgerPda = (
  loanRef: bigint,
  mint: PublicKey,
  streamLoan = SAFETY_STREAM_LOAN_PROGRAM_ID,
) => pda(streamLoan, enc("ledger"), u64le(loanRef), mint.toBytes());
/** stipend_pool escrow of a slot: ["owed", mint, fieldOf(slot PDA) 32 B BE, loan_ref u64 LE] under the pool program. */
export const streamEscrowPda = (
  loanRef: bigint,
  mint: PublicKey,
  streamLoan = SAFETY_STREAM_LOAN_PROGRAM_ID,
  poolProgram = SAFETY_POOL_ESCROW_PROGRAM_ID,
) =>
  pda(
    poolProgram,
    enc("owed"),
    mint.toBytes(),
    be32(fieldOf(streamSlotPda(loanRef, streamLoan))),
    u64le(loanRef),
  );

/** Deposit caps of a new pool: accounted assets after a deposit, and per deposit (base units of the mint). */
export interface DepositCaps {
  authority: PublicKey;
  maxTotal: bigint;
  maxPerDeposit: bigint;
}

/** Only the program's upgrade authority may sign as `payer`; it names the pool's config authority (also its underwriter) and caps. */
export function safetyInitPoolIx(
  programId: PublicKey,
  payer: PublicKey,
  mint: PublicKey,
  caps: DepositCaps,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(
    programId,
    "init_pool",
    [
      w(safetyConfigPda(programId, mint)),
      r(mint),
      w(safetyVaultPda(programId, mint)),
      w(payer, true),
      r(tokenProgram),
      r(SystemProgram.programId),
      r(programDataPda(programId)),
    ],
    caps.authority.toBytes(),
    u64le(caps.maxTotal),
    u64le(caps.maxPerDeposit),
  );
}

/** Config authority: deposit caps. */
export function safetySetDepositCapsIx(
  programId: PublicKey,
  authority: PublicKey,
  mint: PublicKey,
  maxTotal: bigint,
  maxPerDeposit: bigint,
): TransactionInstruction {
  return anchorIx(
    programId,
    "set_deposit_caps",
    [w(safetyConfigPda(programId, mint)), r(authority, true)],
    u64le(maxTotal),
    u64le(maxPerDeposit),
  );
}

/** Config authority: pause or resume deposits and new covers (never unbonding, withdrawals or slashes). */
export function safetySetDepositsPausedIx(
  programId: PublicKey,
  authority: PublicKey,
  mint: PublicKey,
  paused: boolean,
): TransactionInstruction {
  return anchorIx(
    programId,
    "set_deposits_paused",
    [w(safetyConfigPda(programId, mint)), r(authority, true)],
    Uint8Array.of(paused ? 1 : 0),
  );
}

/** Underwriting terms set by the config authority. `loanAsset` = PublicKey.default insures nothing. */
export interface Underwriting {
  loanAsset: PublicKey;
  maxCover: bigint;
  maxExposure: bigint;
  minPremiumBps: number;
}
export function safetySetUnderwritingIx(
  programId: PublicKey,
  authority: PublicKey,
  mint: PublicKey,
  u: Underwriting,
): TransactionInstruction {
  const bps = new Uint8Array(2);
  new DataView(bps.buffer).setUint16(0, u.minPremiumBps, true);
  return anchorIx(
    programId,
    "set_underwriting",
    [w(safetyConfigPda(programId, mint)), r(authority, true)],
    u.loanAsset.toBytes(),
    u64le(u.maxCover),
    u64le(u.maxExposure),
    bps,
  );
}

/** Config authority: hand the pool's config authority (and underwriting) over. */
export function safetySetConfigAuthorityIx(
  programId: PublicKey,
  authority: PublicKey,
  mint: PublicKey,
  next: PublicKey,
): TransactionInstruction {
  return anchorIx(
    programId,
    "set_config_authority",
    [w(safetyConfigPda(programId, mint)), r(authority, true)],
    next.toBytes(),
  );
}

/** Least premium for `cover` (safety_pool::min_premium): cover * bps / 10,000 rounded up. */
export const minPremium = (cover: bigint, minPremiumBps: number) =>
  (cover * BigInt(minPremiumBps) + 9_999n) / 10_000n;

export function safetyDepositIx(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  from: PublicKey,
  amount: bigint,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(
    programId,
    "deposit",
    [
      w(safetyConfigPda(programId, mint)),
      w(positionPda(programId, mint, owner)),
      r(mint),
      w(safetyVaultPda(programId, mint)),
      w(from),
      w(owner, true),
      r(tokenProgram),
      r(SystemProgram.programId),
    ],
    u64le(amount),
  );
}

export function requestUnbondIx(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  shares: bigint,
): TransactionInstruction {
  return anchorIx(
    programId,
    "request_unbond",
    [
      r(safetyConfigPda(programId, mint)),
      w(positionPda(programId, mint, owner)),
      r(owner, true),
    ],
    u128le(shares),
  );
}

export function safetyWithdrawIx(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  to: PublicKey,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(programId, "withdraw", [
    w(safetyConfigPda(programId, mint)),
    w(positionPda(programId, mint, owner)),
    r(mint),
    w(safetyVaultPda(programId, mint)),
    w(to),
    r(owner, true),
    r(tokenProgram),
  ]);
}

/** The slot lender and the pool's underwriter (config authority) both sign. `cover` is the most a slash may pay. */
export function insureIx(
  programId: PublicKey,
  lender: PublicKey,
  mint: PublicKey,
  from: PublicKey,
  loanRef: bigint,
  premium: bigint,
  cover: bigint,
  underwriter: PublicKey,
  tokenProgram = TOKEN22_PROGRAM_ID,
  streamLoan = SAFETY_STREAM_LOAN_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(
    programId,
    "insure",
    [
      w(safetyConfigPda(programId, mint)),
      w(coverPda(programId, loanRef)),
      r(streamSlotPda(loanRef, streamLoan)),
      r(mint),
      w(safetyVaultPda(programId, mint)),
      w(from),
      w(lender, true),
      r(tokenProgram),
      r(SystemProgram.programId),
      r(underwriter, true),
    ],
    u64le(loanRef),
    u64le(premium),
    u64le(cover),
  );
}

/** Anyone but a launch wallet: adds what the vault receives of `amount` to the pool's assets without minting shares
 * (raises every share's value). Refused while the pool has no shares. The flywheel funds it from platform fees only. */
export function safetyTopUpIx(
  programId: PublicKey,
  funder: PublicKey,
  mint: PublicKey,
  from: PublicKey,
  amount: bigint,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(
    programId,
    "top_up",
    [
      w(safetyConfigPda(programId, mint)),
      r(mint),
      w(safetyVaultPda(programId, mint)),
      w(from),
      r(funder, true),
      r(tokenProgram),
    ],
    u64le(amount),
  );
}

/** The loan's accounts slash/shortfall read: the slot, its inbox ATA for the loan asset, its ledger, and the pool escrow of the slot. */
export interface LoanAccounts {
  slot: PublicKey;
  inbox: PublicKey;
  ledger: PublicKey;
  escrow: PublicKey;
}
export function loanAccounts(
  loanRef: bigint,
  asset: PublicKey,
  assetTokenProgram: PublicKey,
  streamLoan = SAFETY_STREAM_LOAN_PROGRAM_ID,
  poolProgram = SAFETY_POOL_ESCROW_PROGRAM_ID,
): LoanAccounts {
  const slot = streamSlotPda(loanRef, streamLoan);
  return {
    slot,
    inbox: ataAddress(slot, asset, assetTokenProgram),
    ledger: streamLedgerPda(loanRef, asset, streamLoan),
    escrow: streamEscrowPda(loanRef, asset, streamLoan, poolProgram),
  };
}

/** Permissionless. `lenderToken` is a token account of the pool's mint owned by the cover's lender. */
export function slashIx(
  programId: PublicKey,
  mint: PublicKey,
  loanRef: bigint,
  loan: LoanAccounts,
  lenderToken: PublicKey,
  tokenProgram = TOKEN22_PROGRAM_ID,
): TransactionInstruction {
  return anchorIx(
    programId,
    "slash",
    [
      w(safetyConfigPda(programId, mint)),
      w(coverPda(programId, loanRef)),
      r(loan.slot),
      r(loan.inbox),
      r(loan.ledger),
      r(mint),
      w(safetyVaultPda(programId, mint)),
      w(lenderToken),
      r(tokenProgram),
      r(loan.escrow),
    ],
    u64le(loanRef),
  );
}

/** Anyone: frees an unpaid cover's exposure once its loan is settled or fully repaid. */
export function releaseCoverIx(
  programId: PublicKey,
  mint: PublicKey,
  loanRef: bigint,
  loan: LoanAccounts,
): TransactionInstruction {
  return anchorIx(
    programId,
    "release_cover",
    [
      w(safetyConfigPda(programId, mint)),
      w(coverPda(programId, loanRef)),
      r(loan.slot),
      r(loan.inbox),
      r(loan.ledger),
      r(loan.escrow),
    ],
    u64le(loanRef),
  );
}

/** View: return data u64 LE, the shortfall slash would see now. */
export function safetyShortfallIx(
  programId: PublicKey,
  loanRef: bigint,
  loan: LoanAccounts,
): TransactionInstruction {
  return anchorIx(
    programId,
    "shortfall",
    [r(loan.slot), r(loan.inbox), r(loan.ledger), r(loan.escrow)],
    u64le(loanRef),
  );
}

export function closePositionIx(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
): TransactionInstruction {
  return anchorIx(programId, "close_position", [
    r(safetyConfigPda(programId, mint)),
    w(positionPda(programId, mint, owner)),
    w(owner, true),
  ]);
}

/** `assets`: the pool's accounted balance (deposits + premiums + top-ups - withdrawals - slashes); shares are priced on it. */
export interface SafetyConfig {
  mint: PublicKey;
  tokenProgram: PublicKey;
  vault: PublicKey;
  decimals: number;
  totalShares: bigint;
  generation: bigint;
  bump: number;
  vaultBump: number;
  assets: bigint;
  authority: PublicKey;
  depositsPaused: boolean;
  maxTotal: bigint;
  maxPerDeposit: bigint;
  loanAsset: PublicKey;
  maxCover: bigint;
  maxExposure: bigint;
  minPremiumBps: number;
  exposure: bigint;
}
export function decodeSafetyConfig(data: Uint8Array): SafetyConfig {
  const rd = new Reader(data, "SafetyConfig");
  return {
    mint: rd.key(),
    tokenProgram: rd.key(),
    vault: rd.key(),
    decimals: rd.u8(),
    totalShares: rd.u128(),
    generation: rd.u64(),
    bump: rd.u8(),
    vaultBump: rd.u8(),
    assets: rd.u64(),
    authority: rd.key(),
    depositsPaused: rd.bool(),
    maxTotal: rd.u64(),
    maxPerDeposit: rd.u64(),
    loanAsset: rd.key(),
    maxCover: rd.u64(),
    maxExposure: rd.u64(),
    minPremiumBps: rd.u16(),
    exposure: rd.u64(),
  };
}

export interface Position {
  owner: PublicKey;
  mint: PublicKey;
  shares: bigint;
  unbonding: bigint;
  readyAt: bigint;
  gen: bigint;
  bump: number;
}
export function decodePosition(data: Uint8Array): Position {
  const rd = new Reader(data, "Position");
  return {
    owner: rd.key(),
    mint: rd.key(),
    shares: rd.u128(),
    unbonding: rd.u128(),
    readyAt: rd.i64(),
    gen: rd.u64(),
    bump: rd.u8(),
  };
}

export interface Cover {
  loanRef: bigint;
  mint: PublicKey;
  lender: PublicKey;
  premium: bigint;
  boundAt: bigint;
  paid: boolean;
  paidOut: bigint;
  bump: number;
  limit: bigint;
  released: boolean;
}
export function decodeCover(data: Uint8Array): Cover {
  const rd = new Reader(data, "Cover");
  return {
    loanRef: rd.u64(),
    mint: rd.key(),
    lender: rd.key(),
    premium: rd.u64(),
    boundAt: rd.i64(),
    paid: rd.bool(),
    paidOut: rd.u64(),
    bump: rd.u8(),
    limit: rd.u64(),
    released: rd.bool(),
  };
}

/** Virtual shares and assets of safety_pool's share price (VIRTUAL_SHARES / VIRTUAL_ASSETS in the program). */
export const SAFETY_VIRTUAL_SHARES = 1_000_000_000n;
export const SAFETY_VIRTUAL_ASSETS = 1_000_000n;
/** A slash leaving more shares per base unit than this retires the generation (safety_pool::MAX_SHARES_PER_ASSET). */
export const SAFETY_MAX_SHARES_PER_ASSET = 1_000_000_000n;
/** Shares a deposit that the vault receives as `amount` mints (safety_pool::shares_for). */
export const sharesFor = (
  amount: bigint,
  assets: bigint,
  totalShares: bigint,
) =>
  (amount * (totalShares + SAFETY_VIRTUAL_SHARES)) /
  (assets + SAFETY_VIRTUAL_ASSETS);
/** H081 that `shares` redeem for now (safety_pool::assets_for, capped at the pool's assets). */
export const redeemable = (
  shares: bigint,
  assets: bigint,
  totalShares: bigint,
) => {
  const out =
    (shares * (assets + SAFETY_VIRTUAL_ASSETS)) /
    (totalShares + SAFETY_VIRTUAL_SHARES);
  return out < assets ? out : assets;
};

/** A staker's view, generation-aware like SafetyPool.sharesOf / unbondingOf. */
export async function readSafetyPosition(
  connection: Connection,
  programId: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
) {
  const [cfgInfo, posInfo] = await connection.getMultipleAccountsInfo(
    [safetyConfigPda(programId, mint), positionPda(programId, mint, owner)],
    "confirmed",
  );
  if (!cfgInfo) {
    throw new Error("safety_pool not initialized for this mint");
  }
  const config = decodeSafetyConfig(cfgInfo.data);
  /** accounted assets (tokens sent straight to the vault are not part of the pool) */
  const poolBalance = config.assets;
  const p = posInfo ? decodePosition(posInfo.data) : undefined;
  const live = p !== undefined && p.gen === config.generation;
  const shares = live ? p!.shares : 0n;
  const unbonding = live ? p!.unbonding : 0n;
  return {
    config,
    poolBalance,
    shares,
    unbonding,
    readyAt: live ? p!.readyAt : 0n,
    value: redeemable(shares, poolBalance, config.totalShares),
    unbondingValue: redeemable(unbonding, poolBalance, config.totalShares),
  };
}

// ------------------------------------------------------------- stream_loan Slot mirror (tests, fixtures)

/** Field-for-field mirror of stream_loan::state::Slot (what safety_pool decodes). */
export interface StreamSlot {
  loanRef: bigint;
  lender: PublicKey;
  bump: number;
  funded: boolean;
  settled: boolean;
  asset: PublicKey;
  tokenProgram: PublicKey;
  principal: bigint;
  repaid: bigint;
  minRemaining: bigint;
  minRate: bigint;
  pledgeBps: number;
  expiry: bigint;
  agentPk: Uint8Array;
  fundedAt: bigint;
  payoutTo: PublicKey;
  streamStart: bigint;
}

/** Anchor-serialized Slot account data (discriminator + borsh). */
export function encodeStreamSlot(s: StreamSlot): Uint8Array {
  const i64 = new Uint8Array(8);
  new DataView(i64.buffer).setBigInt64(0, s.fundedAt, true);
  const u16 = new Uint8Array(2);
  new DataView(u16.buffer).setUint16(0, s.pledgeBps, true);
  return concatBytes(
    accountDiscriminator("Slot"),
    u64le(s.loanRef),
    s.lender.toBytes(),
    Uint8Array.of(s.bump, s.funded ? 1 : 0, s.settled ? 1 : 0),
    s.asset.toBytes(),
    s.tokenProgram.toBytes(),
    u64le(s.principal),
    u64le(s.repaid),
    u128le(s.minRemaining),
    u128le(s.minRate),
    u16,
    u64le(s.expiry),
    s.agentPk,
    i64,
    s.payoutTo.toBytes(),
    u64le(s.streamStart),
  );
}

export function decodeStreamSlot(data: Uint8Array): StreamSlot {
  const rd = new Reader(data, "Slot");
  return {
    loanRef: rd.u64(),
    lender: rd.key(),
    bump: rd.u8(),
    funded: rd.bool(),
    settled: rd.bool(),
    asset: rd.key(),
    tokenProgram: rd.key(),
    principal: rd.u64(),
    repaid: rd.u64(),
    minRemaining: rd.u128(),
    minRate: rd.u128(),
    pledgeBps: rd.u16(),
    expiry: rd.u64(),
    agentPk: rd.bytes(32),
    fundedAt: rd.i64(),
    payoutTo: rd.key(),
    streamStart: rd.u64(),
  };
}

/** Anchor-serialized stream_loan Ledger { loan_ref, mint, held, received, bump }. */
export function encodeStreamLedger(l: {
  loanRef: bigint;
  mint: PublicKey;
  held: bigint;
  received: bigint;
  bump: number;
}): Uint8Array {
  return concatBytes(
    accountDiscriminator("Ledger"),
    u64le(l.loanRef),
    l.mint.toBytes(),
    u64le(l.held),
    u64le(l.received),
    Uint8Array.of(l.bump),
  );
}

// ------------------------------------------------------------- views via simulateTransaction

/** The runtime drops trailing zero bytes of return data; pad back to the borsh size. */
export function padTo(b: Uint8Array, n: number): Uint8Array {
  if (b.length >= n) {
    return b;
  }
  const out = new Uint8Array(n);
  out.set(b);
  return out;
}

/** Simulates `ix` and returns the program's return data (throws on failure). */
export async function simulateReturn(
  connection: Connection,
  feePayer: Keypair,
  ix: TransactionInstruction,
): Promise<Uint8Array> {
  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
    ix,
  );
  tx.feePayer = feePayer.publicKey;
  tx.recentBlockhash = (
    await connection.getLatestBlockhash("confirmed")
  ).blockhash;
  tx.sign(feePayer);
  const res = await connection.simulateTransaction(tx);
  if (res.value.err) {
    throw new Error(
      `simulation failed: ${JSON.stringify(res.value.err)}\n${(res.value.logs ?? []).join("\n")}`,
    );
  }
  const rd = res.value.returnData;
  if (!rd) {
    return new Uint8Array();
  }
  return Uint8Array.from(Buffer.from(rd.data[0], "base64"));
}

export async function viewCapacity(
  connection: Connection,
  feePayer: Keypair,
  programId: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
): Promise<Capacity> {
  return decodeCapacity(
    await simulateReturn(
      connection,
      feePayer,
      capacityViewIx(programId, mint, owner),
    ),
  );
}

export async function viewShortfall(
  connection: Connection,
  feePayer: Keypair,
  programId: PublicKey,
  loanRef: bigint,
  loan: LoanAccounts,
): Promise<bigint> {
  const ret = padTo(
    await simulateReturn(
      connection,
      feePayer,
      safetyShortfallIx(programId, loanRef, loan),
    ),
    8,
  );
  return new DataView(ret.buffer, ret.byteOffset, ret.byteLength).getBigUint64(
    0,
    true,
  );
}
