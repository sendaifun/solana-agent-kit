// The lender's side of a stream-backed loan on Solana (stream_loan program, docs/SOLANA-PORT.md 3.2).
// Program layer: PDAs, instruction builders and account decoders. The wallet (SolanaLoanLenderWallet) is below.
import { sha256 } from "@noble/hashes/sha2";
import {
  type AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  type Allowance,
  allowanceCommitment,
  allowanceNullifier,
  lenderClaimable,
  nextRho,
} from "../crypto.js";
import {
  type AllowanceRecord,
  type LenderInfo,
  type LenderPayload,
  type MemoViews,
  type ViewingKey,
  unpackMemos,
} from "../encryption.js";
import { LEVELS, spendInput } from "../inputs.js";
import { MerkleTree } from "../merkle.js";
import type { ProofResult } from "../prover.js";
import {
  type SentTx,
  closeBuffer,
  send,
  simulate,
  uploadBuffer,
} from "./buffer.js";
import {
  concatBytes,
  encodeProof,
  fieldOf,
  fromBe,
  u32le,
  u64le,
} from "./field.js";
import {
  DEFAULT_PUBKEY,
  type SpendAccounts,
  type SpendArgs,
  encodeSpendArgs,
  encodeSpendExt,
  extDataHash,
  pullLenderShareIx,
  spendIx,
} from "./ops.js";
import { escrowPda, poolPda } from "./pda.js";
import {
  LOCALNET_POOL_PROGRAM_ID,
  type StreamArgs,
  bufferCloseIx,
  encodeStreamArgs,
  programDataAddress,
} from "./program.js";
import { createAtaIdempotentIx } from "./token.js";
import {
  OP_CU_LIMIT,
  type SolPledgeTerms,
  type SolanaPool,
  openSolLenderMemo,
  solAllowanceMemo,
  solSealForLender,
} from "./wallet.js";

/** Localnet stream_loan program id (solana/keys/stream_loan-keypair.json, declared in programs/stream_loan). */
export const LOCALNET_LOAN_PROGRAM_ID = new PublicKey(
  "FvM9Xczax1TCU15imjdNAMg8JXP4apSs2pn9LWCdjyPc",
);

export const SPL_TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

/** Seconds after the allowance's expiry before an unpaid loan counts as a shortfall. */
export const GRACE = 7n * 86400n;

/** Anchor custom error codes of stream_loan (6000 + variant index). */
export const LOAN_ERROR = {
  NotTheLender: 6000,
  AlreadyFunded: 6001,
  WrongSlot: 6002,
  WrongAsset: 6003,
  StreamNotStarted: 6004,
  BadPayout: 6005,
  NoLoan: 6006,
  NothingOwed: 6007,
  NotAClaim: 6008,
  WrongPoolProgram: 6009,
  BadBuffer: 6010,
  BadPayload: 6011,
  BadTokenProgram: 6012,
  BadMint: 6013,
  BadInbox: 6014,
  BadLenderAccount: 6015,
  Overflow: 6016,
  BadEscrow: 6017,
  EscrowNotEmpty: 6018,
  BadTreasury: 6019,
  UpgradeAuthority: 6020,
  PayoutNotProven: 6021,
  PrincipalTooLarge: 6022,
} as const;

/**
 * The stream proof audience `fund` requires: fieldOf(payoutTo). The borrower proves for the token account the
 * principal must go to, so a lender cannot pay it anywhere else.
 */
export const payoutAudience = (payoutTo: PublicKey): bigint =>
  fieldOf(payoutTo);

/** Largest principal a stream proof backs (stream_loan::max_principal): minRemaining * pledgeBps / 10,000. */
export const maxPrincipal = (
  minRemaining: bigint,
  pledgeBps: number | bigint,
): bigint => (minRemaining * BigInt(pledgeBps)) / 10_000n;

/**
 * Owner of the treasury token accounts that receive the loan origination fee (stream_loan fee::TREASURY).
 * PLACEHOLDER until the treasury multisig exists; keep it equal to the program constant.
 */
export const LOAN_TREASURY = new PublicKey(
  "TreasuryP1aceho1derSetMeBeforeMainnet111111",
);
/** Origination fee in basis points of the principal (stream_loan fee::ORIGINATION_FEE_BPS). A platform fee only. */
export const ORIGINATION_FEE_BPS = 25n;

/** The origination fee `fund` takes out of the payout: principal * 25 / 10_000, rounded down. The loan owes the full principal. */
export function originationFee(principal: bigint): bigint {
  return (principal * ORIGINATION_FEE_BPS) / 10_000n;
}

/** The treasury's associated token account for `mint`: where `fund` sends the origination fee. */
export function loanTreasuryAccount(
  mint: PublicKey,
  tokenProgram = SPL_TOKEN_PROGRAM_ID,
  treasuryOwner = LOAN_TREASURY,
): PublicKey {
  return associatedTokenAddress(treasuryOwner, mint, tokenProgram);
}
/** Anchor's own error for a `has_one` / seeds mismatch etc. are 2000-range; `has_one = lender` maps to NotTheLender. */

const enc = (s: string) => new TextEncoder().encode(s);

// ------------------------------------------------------------- PDAs

/** Loan-ref counter: ["registry"]. */
export function registryPda(programId = LOCALNET_LOAN_PROGRAM_ID): PublicKey {
  return PublicKey.findProgramAddressSync([enc("registry")], programId)[0];
}

/** One slot (= one loan): ["slot", loan_ref u64 LE]. Borrowers pledge to lenderAddr = fieldOf(this PDA). */
export function slotPda(
  loanRef: bigint,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("slot"), u64le(loanRef)],
    programId,
  )[0];
}

/** Per (slot, mint) inbox accounting: ["ledger", loan_ref u64 LE, mint]. */
export function ledgerPda(
  loanRef: bigint,
  mint: PublicKey,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("ledger"), u64le(loanRef), mint.toBytes()],
    programId,
  )[0];
}

/** Associated token account of `owner` (on or off curve) for `mint`. */
export function associatedTokenAddress(
  owner: PublicKey,
  mint: PublicKey,
  tokenProgram = SPL_TOKEN_PROGRAM_ID,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBytes(), tokenProgram.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

/** The slot's inbox: where the pool delivers every share routed to (fieldOf(slot PDA), loanRef). */
export function slotInbox(
  loanRef: bigint,
  mint: PublicKey,
  tokenProgram = SPL_TOKEN_PROGRAM_ID,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): PublicKey {
  return associatedTokenAddress(
    slotPda(loanRef, programId),
    mint,
    tokenProgram,
  );
}

/**
 * stipend_pool's escrow for shares routed to the slot that the pool could not deliver to the inbox:
 * ["owed", mint, fieldOf(slot PDA), loan_ref] under the pool program. stream_loan counts its balance as paid.
 */
export function slotEscrow(
  loanRef: bigint,
  mint: PublicKey,
  poolProgram = LOCALNET_POOL_PROGRAM_ID,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): PublicKey {
  return escrowPda(
    poolProgram,
    mint,
    fieldOf(slotPda(loanRef, programId)),
    loanRef,
  );
}

/** What a borrower pledges to for `loanRef`: the slot PDA as the lender account, and its field value. */
export function slotLenderAddr(
  loanRef: bigint,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): { lender: PublicKey; lenderAddr: bigint } {
  const lender = slotPda(loanRef, programId);
  return { lender, lenderAddr: fieldOf(lender) };
}

// ------------------------------------------------------------- instructions

const disc = (name: string) => sha256(enc(`global:${name}`)).subarray(0, 8);
const ix = (
  programId: PublicKey,
  name: string,
  keys: AccountMeta[],
  ...args: Uint8Array[]
) =>
  new TransactionInstruction({
    programId,
    keys,
    data: Buffer.from(concatBytes(disc(name), ...args)),
  });
const w = (pubkey: PublicKey, isSigner = false): AccountMeta => ({
  pubkey,
  isSigner,
  isWritable: true,
});
const r = (pubkey: PublicKey, isSigner = false): AccountMeta => ({
  pubkey,
  isSigner,
  isWritable: false,
});

/** Only the stream_loan program's upgrade authority may sign as `payer` (checked against its ProgramData account). */
export function loanInitializeIx(
  payer: PublicKey,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): TransactionInstruction {
  return ix(programId, "initialize", [
    w(registryPda(programId)),
    w(payer, true),
    r(SystemProgram.programId),
    r(programDataAddress(programId)),
  ]);
}

/** Opens slot `nextLoanRef` (read it from the registry first; the PDA is derived from it). */
export function openSlotIx(
  lender: PublicKey,
  nextLoanRef: bigint,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): TransactionInstruction {
  return ix(programId, "open_slot", [
    w(registryPda(programId)),
    w(slotPda(nextLoanRef, programId)),
    w(lender, true),
    r(SystemProgram.programId),
  ]);
}

export interface FundAccounts {
  lender: PublicKey;
  loanRef: bigint;
  principal: bigint;
  poolProgram: PublicKey;
  poolState: PublicKey;
  buffer: PublicKey;
  mint: PublicKey;
  lenderSource: PublicKey;
  payoutTo: PublicKey;
  tokenProgram?: PublicKey;
  /** defaults to loanTreasuryAccount(mint); the program refuses any other account */
  treasury?: PublicKey;
}

/**
 * Fund against the stream proof staged in `buffer` (a stipend_pool Buffer holding borsh (Proof, StreamArgs)).
 * `payoutTo` receives principal - originationFee(principal), the treasury account the fee (it must exist when
 * the fee is above 0); the loan owes the full principal.
 * The proof's audience must be fieldOf(payoutTo) and the principal at most maxPrincipal(minRemaining, pledgeBps).
 * Whatever already sits in the inbox stays there and counts as repayment at the next sync (shares routed to an
 * unfunded slot are never forwarded); the pool escrow of the slot must be empty (pull it into the inbox first,
 * see SolanaLoanLenderWallet.fundUnchecked).
 */
export function fundIx(
  a: FundAccounts,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): TransactionInstruction {
  const tp = a.tokenProgram ?? SPL_TOKEN_PROGRAM_ID;
  return ix(
    programId,
    "fund",
    [
      w(slotPda(a.loanRef, programId)),
      w(a.lender, true),
      r(a.poolProgram),
      r(a.poolState),
      r(a.buffer),
      r(a.mint),
      w(a.lenderSource),
      w(a.payoutTo),
      w(slotInbox(a.loanRef, a.mint, tp, programId)),
      r(tp),
      r(ASSOCIATED_TOKEN_PROGRAM_ID),
      r(SystemProgram.programId),
      w(ledgerPda(a.loanRef, a.mint, programId)),
      r(
        escrowPda(
          a.poolProgram,
          a.mint,
          fieldOf(slotPda(a.loanRef, programId)),
          a.loanRef,
        ),
      ),
      w(a.treasury ?? loanTreasuryAccount(a.mint, tp)),
    ],
    u64le(a.loanRef),
    u64le(a.principal),
  );
}

/** Permissionless: credit and forward what arrived in the slot's inbox. `lender` is the slot's lender (for its ATA). */
export function syncIx(
  payer: PublicKey,
  loanRef: bigint,
  mint: PublicKey,
  lender: PublicKey,
  tokenProgram = SPL_TOKEN_PROGRAM_ID,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): TransactionInstruction {
  return ix(
    programId,
    "sync",
    [
      w(slotPda(loanRef, programId)),
      w(ledgerPda(loanRef, mint, programId)),
      w(payer, true),
      r(mint),
      w(slotInbox(loanRef, mint, tokenProgram, programId)),
      w(associatedTokenAddress(lender, mint, tokenProgram)),
      r(tokenProgram),
      r(SystemProgram.programId),
    ],
    u64le(loanRef),
  );
}

export function collectIx(
  lender: PublicKey,
  loanRef: bigint,
  mint: PublicKey,
  destination: PublicKey,
  tokenProgram = SPL_TOKEN_PROGRAM_ID,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): TransactionInstruction {
  return ix(
    programId,
    "collect",
    [
      r(slotPda(loanRef, programId)),
      w(ledgerPda(loanRef, mint, programId)),
      r(lender, true),
      r(mint),
      w(slotInbox(loanRef, mint, tokenProgram, programId)),
      w(destination),
      r(tokenProgram),
    ],
    u64le(loanRef),
  );
}

/**
 * Lender claim through the registry: `spend` is the stipend_pool `spend` instruction (data + accounts) built
 * for the claim; its accounts are passed through and the slot PDA signs for the pool by CPI.
 */
export function claimIx(
  lender: PublicKey,
  loanRef: bigint,
  mint: PublicKey,
  spend: TransactionInstruction,
  tokenProgram = SPL_TOKEN_PROGRAM_ID,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): TransactionInstruction {
  const slot = slotPda(loanRef, programId);
  // only the lender signs the outer transaction; the slot PDA (the pool's lender signer) is signed by CPI
  const passthrough = spend.keys.map((k) => ({
    ...k,
    isSigner: k.isSigner && k.pubkey.equals(lender),
  }));
  return ix(
    programId,
    "claim",
    [
      w(slot),
      w(ledgerPda(loanRef, mint, programId)),
      w(lender, true),
      r(spend.programId),
      r(mint),
      w(slotInbox(loanRef, mint, tokenProgram, programId)),
      w(associatedTokenAddress(lender, mint, tokenProgram)),
      r(tokenProgram),
      r(SystemProgram.programId),
      ...passthrough,
    ],
    u64le(loanRef),
    u32le(spend.data.length),
    Uint8Array.from(spend.data),
  );
}

export function settleIx(
  lender: PublicKey,
  loanRef: bigint,
  programId = LOCALNET_LOAN_PROGRAM_ID,
): TransactionInstruction {
  return ix(
    programId,
    "settle",
    [w(slotPda(loanRef, programId)), r(lender, true)],
    u64le(loanRef),
  );
}

/**
 * View (simulate it): return data is the shortfall as u64 LE. `asset`/`tokenProgram` are the loan's. The
 * unsynced inbox balance and the pool escrow of the slot count as paid.
 */
export function shortfallIx(
  loanRef: bigint,
  asset: PublicKey,
  tokenProgram = SPL_TOKEN_PROGRAM_ID,
  programId = LOCALNET_LOAN_PROGRAM_ID,
  poolProgram = LOCALNET_POOL_PROGRAM_ID,
): TransactionInstruction {
  return ix(
    programId,
    "shortfall",
    [
      r(slotPda(loanRef, programId)),
      r(slotInbox(loanRef, asset, tokenProgram, programId)),
      r(ledgerPda(loanRef, asset, programId)),
      r(slotEscrow(loanRef, asset, poolProgram, programId)),
    ],
    u64le(loanRef),
  );
}

// ------------------------------------------------------------- accounts

class Reader {
  o = 8; // skip the Anchor discriminator
  constructor(readonly d: Uint8Array) {}
  private dv() {
    return new DataView(this.d.buffer, this.d.byteOffset, this.d.byteLength);
  }
  u8() {
    return this.d[this.o++];
  }
  bool() {
    return this.u8() !== 0;
  }
  u16() {
    const v = this.dv().getUint16(this.o, true);
    this.o += 2;
    return v;
  }
  u64() {
    const v = this.dv().getBigUint64(this.o, true);
    this.o += 8;
    return v;
  }
  i64() {
    const v = this.dv().getBigInt64(this.o, true);
    this.o += 8;
    return v;
  }
  u128() {
    const lo = this.u64();
    const hi = this.u64();
    return (hi << 64n) | lo;
  }
  key() {
    const k = new PublicKey(this.d.subarray(this.o, this.o + 32));
    this.o += 32;
    return k;
  }
  be32() {
    const v = fromBe(this.d.subarray(this.o, this.o + 32));
    this.o += 32;
    return v;
  }
}

export interface RegistryAccount {
  nextLoanRef: bigint;
}
export function decodeRegistry(data: Uint8Array): RegistryAccount {
  return { nextLoanRef: new Reader(data).u64() };
}

/** The Slot account (Anchor borsh, after the discriminator). Mirrors StreamLoan's Slot + Loan. */
export interface SlotAccount {
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
  pledgeBps: bigint;
  expiry: bigint;
  agentPk: bigint;
  fundedAt: bigint;
  payoutTo: PublicKey;
  streamStart: bigint;
}
export function decodeSlot(data: Uint8Array): SlotAccount {
  const x = new Reader(data);
  return {
    loanRef: x.u64(),
    lender: x.key(),
    bump: x.u8(),
    funded: x.bool(),
    settled: x.bool(),
    asset: x.key(),
    tokenProgram: x.key(),
    principal: x.u64(),
    repaid: x.u64(),
    minRemaining: x.u128(),
    minRate: x.u128(),
    pledgeBps: BigInt(x.u16()),
    expiry: x.u64(),
    agentPk: x.be32(),
    fundedAt: x.i64(),
    payoutTo: x.key(),
    streamStart: x.u64(),
  };
}

export interface LedgerAccount {
  loanRef: bigint;
  mint: PublicKey;
  held: bigint;
  received: bigint;
}
export function decodeLedger(data: Uint8Array): LedgerAccount {
  const x = new Reader(data);
  return { loanRef: x.u64(), mint: x.key(), held: x.u64(), received: x.u64() };
}

/** The LoanFunded event (`emit!`, logged as "Program data: <base64>"). `principal` is owed; `payoutTo` received principal - fee. */
export interface LoanFundedEvent {
  loanRef: bigint;
  lender: PublicKey;
  asset: PublicKey;
  principal: bigint;
  fee: bigint;
  payoutTo: PublicKey;
}
const LOAN_FUNDED_DISC = sha256(enc("event:LoanFunded")).subarray(0, 8);
/** The LoanFunded events in a transaction's logs (e.g. SentTx.logs of a fund). */
export function loanFundedEvents(logs: string[]): LoanFundedEvent[] {
  const out: LoanFundedEvent[] = [];
  for (const line of logs) {
    if (!line.startsWith("Program data: ")) {
      continue;
    }
    const d = new Uint8Array(
      Buffer.from(line.slice("Program data: ".length), "base64"),
    );
    if (
      d.length < 8 + 8 + 32 + 32 + 8 + 8 + 32 ||
      !LOAN_FUNDED_DISC.every((b, i) => d[i] === b)
    ) {
      continue;
    }
    const x = new Reader(d);
    out.push({
      loanRef: x.u64(),
      lender: x.key(),
      asset: x.key(),
      principal: x.u64(),
      fee: x.u64(),
      payoutTo: x.key(),
    });
  }
  return out;
}

/** Same rule as the program: unpaid principal once expiry + GRACE has passed (`pending`: unsynced inbox value plus the pool escrow, which count as paid). */
export function shortfallOf(s: SlotAccount, now: bigint, pending = 0n): bigint {
  if (!s.funded || s.settled || s.expiry === 0n) {
    return 0n;
  }
  if (now <= s.expiry + GRACE) {
    return 0n;
  }
  const paid = s.repaid + pending;
  return paid >= s.principal ? 0n : s.principal - paid;
}

// ============================================================= wallet

/** A pledged note as the lender knows it. `lost`: spent on chain, and no successor memo the lender could read. */
export interface SolLenderNote {
  allowance: Allowance;
  commitment: bigint;
  index: number;
  spent: boolean;
  lost: boolean;
  views: MemoViews;
  lender: LenderInfo;
  mint?: PublicKey;
}

/** Records handed over before their commitment appeared on chain are kept up to this many; older ones are dropped. */
export const PENDING_MAX = 256;

type LenderRecord = AllowanceRecord & {
  lender: LenderInfo;
  mint?: PublicKey;
  lenderKey?: PublicKey;
};

/** The memos a claim writes (see claimMemos). */
export interface SolSpendMemos {
  encryptedAllowance: Uint8Array;
  encryptedPayment: Uint8Array;
  encryptedLender: Uint8Array;
}

/** A lender claim built and proven but not sent (tests replay or tamper with it). */
export interface PreparedLoanClaim {
  loanRef: bigint;
  mint: PublicKey;
  tokenProgram: PublicKey;
  amount: bigint;
  next: Allowance;
  proof: ProofResult;
  args: SpendArgs;
  accounts: Omit<SpendAccounts, "buffer">;
  payload: Uint8Array;
}

function safeUnpack(b: Uint8Array): Uint8Array[] {
  try {
    return unpackMemos(b);
  } catch {
    return [];
  }
}

/**
 * The lender's side of a stream-backed loan through the stream_loan registry: the surface of LenderWallet
 * in src/lender.ts. Tracks the pledged notes it was handed, follows their successors on chain (every spend on
 * a pledged note emits a LenderMemo for the lender), prices what it may claim, and pulls the vested share
 * through the registry (the slot PDA signs the pool's lender claim). On Solana each slot is its own
 * lenderAddr, fieldOf(slot PDA), so `address(loanRef)` replaces the registry-wide address of the EVM wallet.
 */
export class SolanaLoanLenderWallet {
  readonly tree = new MerkleTree(LEVELS);
  /** every pledged note this lender knows, by commitment */
  readonly notes = new Map<bigint, SolLenderNote>();
  private pending: LenderRecord[] = [];
  private nullifierSet = new Set<bigint>();
  private cursor = 0;
  private treeQueue = new Map<
    number,
    { commitment: bigint; memo: Uint8Array }
  >();

  /** `signer` owns the slots (open_slot, fund, claim, settle check it) and pays fees. */
  constructor(
    readonly pool: SolanaPool,
    readonly signer: Keypair,
    readonly view: ViewingKey,
    readonly programId: PublicKey = LOCALNET_LOAN_PROGRAM_ID,
    /** owner of the fee treasury accounts: stream_loan fee::TREASURY of the build this wallet talks to */
    readonly treasuryOwner: PublicKey = LOAN_TREASURY,
  ) {
    // localnet defaults against any other stipend_pool are a wrong-cluster setup (the program would refuse
    // the treasury, or the ids would not be the deployed ones): demand explicit ids instead
    if (
      !pool.programId.equals(LOCALNET_POOL_PROGRAM_ID) &&
      (programId.equals(LOCALNET_LOAN_PROGRAM_ID) ||
        treasuryOwner.equals(LOAN_TREASURY))
    ) {
      throw new Error(
        "SolanaLoanLenderWallet: pass the stream_loan program id and treasury owner of this cluster (the defaults are localnet only)",
      );
    }
  }

  get connection(): Connection {
    return this.pool.connection;
  }

  /** What a borrower's owner needs to pledge to this lender for `loanRef`. */
  address(loanRef: bigint): {
    lender: PublicKey;
    lenderAddr: bigint;
    loanRef: bigint;
    viewPub: Uint8Array;
  } {
    const { lender, lenderAddr } = slotLenderAddr(loanRef, this.programId);
    return { lender, lenderAddr, loanRef, viewPub: this.view.pub };
  }

  /** Pledge terms for SolanaWallet.grant / pledge. */
  terms(loanRef: bigint, pledgeBps: bigint): SolPledgeTerms {
    return {
      lender: slotPda(loanRef, this.programId),
      loanRef,
      pledgeBps,
      lenderViewPub: this.view.pub,
    };
  }

  /** True when the note's lender is one of this registry's slots. */
  private ours(l: LenderInfo): boolean {
    return (
      l.loanRef > 0n &&
      fieldOf(slotPda(l.loanRef, this.programId)) === l.lenderAddr
    );
  }

  // ---- registry ----

  /** Creates the registry's loan-ref counter if missing. The signer must be the program's upgrade authority. */
  async initialize(): Promise<void> {
    if (
      await this.connection.getAccountInfo(
        registryPda(this.programId),
        "confirmed",
      )
    ) {
      return;
    }
    await send(this.connection, this.signer, [
      loanInitializeIx(this.signer.publicKey, this.programId),
    ]);
  }

  /** Reserve a slot; the borrower pledges to (fieldOf(slot PDA), loanRef). Retries if another lender took the ref first. */
  async openSlot(): Promise<bigint> {
    for (let attempt = 0; ; attempt++) {
      const info = await this.connection.getAccountInfo(
        registryPda(this.programId),
        "confirmed",
      );
      if (!info) {
        throw new Error("registry not initialized");
      }
      const ref = decodeRegistry(info.data).nextLoanRef;
      try {
        await send(this.connection, this.signer, [
          openSlotIx(this.signer.publicKey, ref, this.programId),
        ]);
        return ref;
      } catch (e) {
        if (attempt >= 3) {
          throw e;
        }
      }
    }
  }

  /**
   * Fund a slot against a stream proof; the principal leaves the lender's associated token account:
   * principal - originationFee(principal) to `payoutTo` (a token account of `mint`), the fee to the treasury.
   * The loan owes the full principal. The proof must describe a live note this lender was handed (same
   * agent, cap, expiry, pledge, routed total, start and asset, with the bounds holding).
   */
  async fund(
    loanRef: bigint,
    stream: { proof: ProofResult; args: StreamArgs },
    mint: PublicKey,
    principal: bigint,
    payoutTo: PublicKey,
  ): Promise<SentTx> {
    const s = stream.args;
    if (s.loanRef !== loanRef) {
      throw new Error("stream proof is for another slot");
    }
    if (!s.lender.equals(slotPda(loanRef, this.programId))) {
      throw new Error("stream proof names another lender");
    }
    if (!s.asset.equals(mint)) {
      throw new Error("stream proof names another asset");
    }
    if (s.audience !== payoutAudience(payoutTo)) {
      throw new Error(
        "stream proof was not made for this payout account (audience must be fieldOf(payoutTo))",
      );
    }
    if (
      principal <= 0n ||
      principal > maxPrincipal(s.minRemaining, s.pledgeBps)
    ) {
      throw new Error("principal is above what the pledge can repay");
    }
    await this.sync();
    const backing = this.current(loanRef).find((n) => {
      const a = n.allowance;
      const P = a.policy;
      return (
        a.agentPk === s.agentPk &&
        P.lifetimeCap === s.lifetimeCap &&
        P.expiry === s.expiry &&
        P.pledgeBps === BigInt(s.pledgeBps) &&
        a.pledgePaid === s.pledgePaid &&
        P.streamStart === s.streamStart &&
        a.asset === fieldOf(mint) &&
        a.remaining >= s.minRemaining &&
        P.streamRate >= s.minRate
      );
    });
    if (!backing) {
      throw new Error(
        "stream proof does not match a live note handed to this lender",
      );
    }
    return this.fundUnchecked(loanRef, stream, mint, principal, payoutTo);
  }

  /** The fund transaction without the SDK-side note checks (the program's checks still apply). */
  async fundUnchecked(
    loanRef: bigint,
    stream: { proof: ProofResult; args: StreamArgs },
    mint: PublicKey,
    principal: bigint,
    payoutTo: PublicKey,
    opts: { pullEscrow?: boolean; treasury?: PublicKey } = {},
  ): Promise<SentTx> {
    const tokenProgram = await this.pool.tokenProgramOf(mint);
    const payload = concatBytes(
      encodeProof(stream.proof.proof),
      encodeStreamArgs(stream.args),
    );
    // a share the pool escrowed for this slot before funding is pulled into the inbox first; it counts as repayment
    const slot = slotPda(loanRef, this.programId);
    const escrowed = await this.pool.tokenBalance(
      slotEscrow(loanRef, mint, this.pool.programId, this.programId),
    );
    const pre =
      escrowed > 0n && opts.pullEscrow !== false
        ? [
            createAtaIdempotentIx(
              this.signer.publicKey,
              slot,
              mint,
              tokenProgram,
            ),
            pullLenderShareIx(
              this.pool.programId,
              mint,
              tokenProgram,
              fieldOf(slot),
              loanRef,
              slotInbox(loanRef, mint, tokenProgram, this.programId),
            ),
          ]
        : [];
    // the treasury's account for the asset must exist when a fee is due; creating it is idempotent (the lender pays rent once per asset)
    if (originationFee(principal) > 0n) {
      pre.push(
        createAtaIdempotentIx(
          this.signer.publicKey,
          this.treasuryOwner,
          mint,
          tokenProgram,
        ),
      );
    }
    const buf = await uploadBuffer(
      this.connection,
      this.pool.programId,
      this.signer,
      payload,
    );
    try {
      return await send(
        this.connection,
        this.signer,
        [
          ...pre,
          fundIx(
            {
              lender: this.signer.publicKey,
              loanRef,
              principal,
              poolProgram: this.pool.programId,
              poolState: poolPda(this.pool.programId),
              buffer: buf.address,
              mint,
              lenderSource: associatedTokenAddress(
                this.signer.publicKey,
                mint,
                tokenProgram,
              ),
              payoutTo,
              tokenProgram,
              treasury:
                opts.treasury ??
                loanTreasuryAccount(mint, tokenProgram, this.treasuryOwner),
            },
            this.programId,
          ),
          bufferCloseIx(this.pool.programId, this.signer.publicKey, buf.seed),
        ],
        { cuLimit: OP_CU_LIMIT },
      );
    } catch (e) {
      await closeBuffer(
        this.connection,
        this.pool.programId,
        this.signer,
        buf.seed,
      ).catch(() => undefined);
      throw e;
    }
  }

  /** Permissionless: credit and forward the shares that reached the slot's inbox (defaults to the loan asset). */
  async syncLoan(
    loanRef: bigint,
    mint?: PublicKey,
    payer: Keypair = this.signer,
  ): Promise<SentTx> {
    const slot = await this.loan(loanRef);
    const m = mint ?? slot.asset;
    return send(this.connection, payer, [
      syncIx(
        payer.publicKey,
        loanRef,
        m,
        slot.lender,
        await this.pool.tokenProgramOf(m),
        this.programId,
      ),
    ]);
  }

  /** The slot's lender takes shares the registry could not forward (lender account missing or frozen). */
  async collect(
    loanRef: bigint,
    mint: PublicKey,
    destination?: PublicKey,
  ): Promise<SentTx> {
    const tp = await this.pool.tokenProgramOf(mint);
    const to =
      destination ??
      (await this.pool.ensureAta(this.signer, mint, this.signer.publicKey));
    return send(this.connection, this.signer, [
      collectIx(this.signer.publicKey, loanRef, mint, to, tp, this.programId),
    ]);
  }

  async settle(loanRef: bigint): Promise<SentTx> {
    return send(this.connection, this.signer, [
      settleIx(this.signer.publicKey, loanRef, this.programId),
    ]);
  }

  async loan(loanRef: bigint): Promise<SlotAccount> {
    const info = await this.connection.getAccountInfo(
      slotPda(loanRef, this.programId),
      "confirmed",
    );
    if (!info) {
      throw new Error(`no slot ${loanRef}`);
    }
    return decodeSlot(info.data);
  }

  async ledger(
    loanRef: bigint,
    mint: PublicKey,
  ): Promise<LedgerAccount | undefined> {
    const info = await this.connection.getAccountInfo(
      ledgerPda(loanRef, mint, this.programId),
      "confirmed",
    );
    return info ? decodeLedger(info.data) : undefined;
  }

  /** The program's shortfall view (simulated; unsynced inbox value and the pool escrow count as paid). */
  async shortfall(loanRef: bigint): Promise<bigint> {
    const s = await this.loan(loanRef);
    const asset = s.funded ? s.asset : PublicKey.default;
    const tp = s.funded ? s.tokenProgram : SPL_TOKEN_PROGRAM_ID;
    const sim = await simulate(this.connection, this.signer, [
      shortfallIx(loanRef, asset, tp, this.programId, this.pool.programId),
    ]);
    if (sim.err) {
      throw new Error(`shortfall view failed: ${JSON.stringify(sim.err)}`);
    }
    const line = sim.logs.find((l) =>
      l.startsWith(`Program return: ${this.programId.toBase58()} `),
    );
    if (!line) {
      throw new Error("shortfall view returned nothing");
    }
    return Buffer.from(line.split(" ")[3], "base64").readBigUInt64LE(0);
  }

  // ---- notes ----

  /** Take in the sealed copy a borrower's owner hands over after a pledge. */
  ingest(payload: LenderPayload): SolLenderNote | undefined {
    const rec = openSolLenderMemo(this.view, payload);
    if (!rec) {
      throw new Error("payload is not a pledged allowance for this key");
    }
    return this.record(rec);
  }

  private record(rec: LenderRecord): SolLenderNote | undefined {
    if (!this.ours(rec.lender)) {
      throw new Error("allowance is pledged to another lender");
    }
    const commitment = allowanceCommitment(rec.allowance);
    const known = this.notes.get(commitment);
    if (known) {
      return known;
    }
    const index = this.tree.indexOf(commitment);
    if (index < 0) {
      this.pending.push(rec);
      if (this.pending.length > PENDING_MAX) {
        this.pending.splice(0, this.pending.length - PENDING_MAX);
      }
      return undefined;
    }
    const note: SolLenderNote = {
      allowance: rec.allowance,
      commitment,
      index,
      spent: this.nullifierSet.has(
        allowanceNullifier(rec.allowance.rho, commitment),
      ),
      lost: false,
      views: rec.views,
      lender: rec.lender,
      mint: rec.mint,
    };
    this.notes.set(commitment, note);
    return note;
  }

  /** Follows the pool's events: commitments (with packed lender copies), LenderMemo successors, nullifiers. */
  async sync(): Promise<void> {
    await this.pool.log.refresh();
    const evs = this.pool.log.events;
    const found: LenderRecord[] = [];
    for (; this.cursor < evs.length; this.cursor++) {
      const e = evs[this.cursor];
      if (e.name === "NewCommitment") {
        this.treeQueue.set(e.index, {
          commitment: e.commitment,
          memo: e.encryptedOutput,
        });
      } else if (e.name === "NewNullifier") {
        this.nullifierSet.add(e.nullifier);
      } else if (e.name === "LenderMemo") {
        const rec = openSolLenderMemo(this.view, e.encryptedLender);
        if (rec && this.ours(rec.lender)) {
          found.push(rec);
        }
      }
    }
    for (
      let next = this.treeQueue.get(this.tree.size);
      next;
      next = this.treeQueue.get(this.tree.size)
    ) {
      this.treeQueue.delete(this.tree.size);
      this.tree.insert(next.commitment);
      // a pledged grant output, sub or residual carries a lender copy in its commitment memo
      for (const m of next.memo.length > 0
        ? [next.memo, ...safeUnpack(next.memo)]
        : []) {
        const rec = openSolLenderMemo(this.view, m);
        if (
          rec &&
          this.ours(rec.lender) &&
          allowanceCommitment(rec.allowance) === next.commitment
        ) {
          found.push(rec);
        }
      }
    }
    const pending = this.pending;
    this.pending = [];
    for (const rec of [...pending, ...found]) {
      this.record(rec);
    }
    // a spent note whose successor (rho' = nextRho(rho)) never reached this lender is lost to the pull path
    const rhos = new Set([...this.notes.values()].map((n) => n.allowance.rho));
    for (const n of this.notes.values()) {
      if (
        this.nullifierSet.has(allowanceNullifier(n.allowance.rho, n.commitment))
      ) {
        n.spent = true;
      }
      n.lost = n.spent && !rhos.has(nextRho(n.allowance.rho));
    }
  }

  /** Live notes pledged to `loanRef`, largest balance first. */
  current(loanRef: bigint): SolLenderNote[] {
    return [...this.notes.values()]
      .filter((n) => !n.spent && n.lender.loanRef === loanRef)
      .sort((a, b) => (a.allowance.remaining > b.allowance.remaining ? -1 : 1));
  }

  /** True when the borrower moved a note of this loan without handing the lender its successor; only the shortfall path remains. */
  opaque(loanRef: bigint): boolean {
    return [...this.notes.values()].some(
      (n) => n.lost && n.lender.loanRef === loanRef,
    );
  }

  /** What the lender may pull right now across every live note of the loan. */
  claimable(loanRef: bigint, now: bigint): bigint {
    return this.current(loanRef).reduce(
      (s, n) => s + lenderClaimable(n.allowance, now),
      0n,
    );
  }

  /**
   * Builds the claim on the loan's live note with the most to claim (`amount` defaults to all of it): the
   * lender-claim spend payload and the stipend_pool `spend` accounts (lender leg to the slot's inbox, the slot
   * PDA as lender signer). Not sent; see `claim`.
   */
  async prepareClaim(
    loanRef: bigint,
    amount?: bigint,
    opts: { now?: bigint } = {},
  ): Promise<PreparedLoanClaim> {
    await this.sync();
    const now = opts.now ?? (await this.pool.now());
    const notes = this.current(loanRef);
    if (notes.length === 0) {
      if (this.opaque(loanRef)) {
        throw new Error(
          "borrower withheld the successor memo; use shortfall/settle",
        );
      }
      throw new Error("no live note for this loan");
    }
    const note = notes.reduce((best, n) =>
      lenderClaimable(n.allowance, now) > lenderClaimable(best.allowance, now)
        ? n
        : best,
    );
    const want = amount ?? lenderClaimable(note.allowance, now);
    if (want <= 0n) {
      throw new Error("nothing claimable yet");
    }
    const slot = await this.loan(loanRef);
    const mint = note.mint ?? (slot.funded ? slot.asset : undefined);
    if (!mint) {
      throw new Error("mint of the pledged note is unknown");
    }
    const base = {
      root: this.tree.root,
      allowance: note.allowance,
      path: this.tree.path(note.index),
      amount: want,
      now,
      claim: true,
      lender: { lenderAddr: note.lender.lenderAddr, loanRef },
    };
    const draft = spendInput({ ...base, extDataHash: 0n });
    const extBytes = encodeSpendExt({
      relayer: DEFAULT_PUBKEY,
      feeRecipient: DEFAULT_PUBKEY,
      ...this.claimMemos(draft.next, note, mint),
    });
    const h = extDataHash(extBytes);
    const built = spendInput({ ...base, extDataHash: h });
    const proof = await this.pool.prover.prove("spend", built.input);
    const args: SpendArgs = {
      root: base.root,
      nullifier: built.nullifier,
      newAllowanceCommitment: built.newAllowanceCommitment,
      payCommitment: 0n,
      publicAmount: 0n,
      publicRecipient: DEFAULT_PUBKEY,
      publicAsset: mint,
      fee: 0n,
      timestamp: now,
      receipt: built.receipt,
      lenderAmount: built.lenderAmount,
      lenderAddr: note.lender.lenderAddr,
      loanRef,
      isLenderClaim: true,
      extDataHash: h,
    };
    const tokenProgram = await this.pool.tokenProgramOf(mint);
    await this.pool.ensureVault(this.signer, mint);
    const accounts: Omit<SpendAccounts, "buffer"> = {
      payer: this.signer.publicKey,
      nullifier: built.nullifier,
      token: { mint, tokenProgram },
      lenderToken: slotInbox(loanRef, mint, tokenProgram, this.programId),
      escrow: { lenderAddr: note.lender.lenderAddr, loanRef },
      lenderSigner: slotPda(loanRef, this.programId),
    };
    return {
      loanRef,
      mint,
      tokenProgram,
      amount: want,
      next: built.next,
      proof,
      args,
      accounts,
      payload: concatBytes(
        encodeProof(proof.proof),
        encodeSpendArgs(args),
        extBytes,
      ),
    };
  }

  /** Sends a prepared claim through the registry (`stream_loan.claim`); the share is credited in the same instruction. */
  async submitClaim(
    p: PreparedLoanClaim,
    loanRef = p.loanRef,
  ): Promise<SentTx> {
    const buf = await uploadBuffer(
      this.connection,
      this.pool.programId,
      this.signer,
      p.payload,
    );
    try {
      const spend = spendIx(this.pool.programId, {
        ...p.accounts,
        buffer: buf.address,
      });
      return await send(
        this.connection,
        this.signer,
        [
          claimIx(
            this.signer.publicKey,
            loanRef,
            p.mint,
            spend,
            p.tokenProgram,
            this.programId,
          ),
        ],
        { cuLimit: OP_CU_LIMIT },
      );
    } catch (e) {
      await closeBuffer(
        this.connection,
        this.pool.programId,
        this.signer,
        buf.seed,
      ).catch(() => undefined);
      throw e;
    }
  }

  /**
   * Pull the vested share from the loan's live note with the most to claim (`amount` defaults to all of it).
   * The registry checks the slot owner and signs the pool's lender claim with the slot PDA. The borrower
   * learns its successor note from the memo this writes.
   */
  async claim(
    loanRef: bigint,
    amount?: bigint,
  ): Promise<{
    tx: SentTx;
    proof: ProofResult;
    next: Allowance;
    amount: bigint;
  }> {
    const p = await this.prepareClaim(loanRef, amount);
    const tx = await this.submitClaim(p);
    await this.sync();
    return { tx, proof: p.proof, next: p.next, amount: p.amount };
  }

  /**
   * The memos a claim writes: the successor for the agent and the owner, and the lender's own copy. A subclass
   * may override it (a lender that withholds the borrower's copy; the borrower recovers anyway).
   */
  protected claimMemos(
    next: Allowance,
    note: SolLenderNote,
    mint: PublicKey,
  ): SolSpendMemos {
    const extra = {
      mint,
      lenderKey: slotPda(note.lender.loanRef, this.programId),
    };
    return {
      encryptedAllowance: solAllowanceMemo(
        next,
        note.views,
        note.lender,
        extra,
      ),
      encryptedPayment: new Uint8Array(),
      encryptedLender: solSealForLender(next, note.views, note.lender, extra),
    };
  }
}
