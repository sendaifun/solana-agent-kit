import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  unpackAccount,
} from "@solana/spl-token";
// SolanaWallet: the surface of `Wallet` in src/client.ts (deposit, transfer, withdraw, grant, pay,
// reclaim, delegate, pledge, transferAllowance, prove, proveStream, treasuryTree, sync) over the
// stipend_pool program. Circuits, inputs, proving and memo encryption are the shared modules
// (crypto.ts, inputs.ts, prover.ts, encryption.ts), unchanged. Only addresses differ: every pubkey that
// enters a circuit is fieldOf(pubkey) (docs/SOLANA-PORT.md section 2), assets are SPL mints.
import {
  AddressLookupTableAccount,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { Account, type StipendAddress, type TreasuryNode } from "../account.js";
import { MAX_INPUTS, nextMerge, selectNotes } from "../consolidate.js";
import {
  Allowance,
  LenderRef,
  Note,
  addressKey,
  allowanceCommitment,
  allowanceNullifier,
  lenderKey,
  nextRho,
  noteCommitment,
  noteNullifier,
  randomField,
  spendAllowance,
} from "../crypto.js";
import { planDelegation } from "../delegation.js";
import {
  AllowancePayload,
  LenderInfo,
  LenderPayload,
  MemoViews,
  NotePayload,
  ViewingKey,
  allowancePayload,
  decodePayload,
  decryptMemo,
  encodePayload,
  encryptMemo,
  noteMemo,
  packMemos,
  parseAllowancePayload,
  unpackMemos,
} from "../encryption.js";
import {
  DELEGATE_OUTPUTS,
  type DisclosureKind,
  GRANT_OUTPUTS,
  LEVELS,
  type NoteInput,
  RECIPIENT_LEVELS,
  type SubGrant,
  delegateInput,
  discloseInput,
  dummyNoteInput,
  grantInput,
  spendInput,
  streamInput,
  transactInput,
} from "../inputs.js";
import { MerklePath, MerkleTree, recipientListRoot } from "../merkle.js";
import { type ProofResult, Prover } from "../prover.js";
import type { RelayerClient, SolanaRelayBody } from "../relayer-client.js";
import {
  abandonPlan,
  planOperation,
  sendV0,
  simulateV0,
  stagePlan,
} from "./alt.js";
import {
  type SentTx,
  closeBuffer,
  customErrorCode,
  send,
  simulate,
  uploadBuffer,
} from "./buffer.js";
import { type LocatedEvent, PoolEventLog } from "./events.js";
import { concatBytes, encodeProof, fieldOf } from "./field.js";
import {
  DEFAULT_PUBKEY,
  SpendAccounts,
  SpendArgs,
  createVaultIx,
  delegateIx,
  encodeDelegateArgs,
  encodeDelegateExt,
  encodeGrantArgs,
  encodeGrantExt,
  encodeSpendArgs,
  encodeSpendExt,
  encodeTransactArgs,
  encodeTransactExt,
  extDataHash,
  grantIx,
  pullLenderShareIx,
  spendIx,
  transactIx,
} from "./ops.js";
import { vaultPda } from "./pda.js";
import { poolPda } from "./pda.js";
import {
  DepositGuard,
  DiscloseArgs,
  LOCALNET_POOL_PROGRAM_ID,
  StreamArgs,
  decodePool,
  encodeDiscloseArgs,
  encodeStreamArgs,
  growPoolIx,
  initializePoolIxs,
  isPoolComplete,
  poolGrowsNeeded,
  verifyDisclosureIx,
  verifyStreamIx,
} from "./program.js";
import { capacityMessage, toB64 } from "./relay.js";

/** Compute-unit limit for initialize + grow_pool (one transaction). */
export const POOL_INIT_CU_LIMIT = 400_000;

/** Compute-unit limit for proof-bearing operations (a 16-way grant uses ~0.7M). */
export const OP_CU_LIMIT = 1_400_000;

// ------------------------------------------------------------------ memos with Solana keys

/** Solana-only fields carried inside an allowance memo (the shared payload format ignores extra fields). */
export interface SolMemoExtra {
  mint?: PublicKey;
  lenderKey?: PublicKey;
}

function solPayload(
  a: Allowance,
  views: MemoViews,
  lender: LenderInfo | undefined,
  extra: SolMemoExtra,
): Uint8Array {
  return encodePayload({
    ...allowancePayload(a, views, lender),
    ...(extra.mint ? { mint: extra.mint.toBase58() } : {}),
    ...(extra.lenderKey ? { lenderKey: extra.lenderKey.toBase58() } : {}),
  });
}

/** allowanceMemo (encryption.ts) plus the mint and the lender's pubkey, which fieldOf cannot be inverted to. */
export function solAllowanceMemo(
  a: Allowance,
  views: MemoViews,
  lender?: LenderInfo,
  extra: SolMemoExtra = {},
): Uint8Array {
  const payload = solPayload(a, views, lender, extra);
  const copies = [
    encryptMemo(views.agent, payload),
    encryptMemo(views.owner, payload),
  ];
  if (lender) {
    copies.push(encryptMemo(lender.viewPub, payload));
  }
  return packMemos(copies);
}

/** sealForLender (encryption.ts) plus the Solana extras. openLenderMemo still opens it. */
export function solSealForLender(
  a: Allowance,
  views: MemoViews,
  lender: LenderInfo,
  extra: SolMemoExtra = {},
): LenderPayload {
  return encryptMemo(lender.viewPub, solPayload(a, views, lender, extra));
}

type SolAllowancePayload = AllowancePayload & {
  mint?: string;
  lenderKey?: string;
};

function extraOf(p: SolAllowancePayload): SolMemoExtra {
  return {
    mint: p.mint ? new PublicKey(p.mint) : undefined,
    lenderKey: p.lenderKey ? new PublicKey(p.lenderKey) : undefined,
  };
}

/** Opens a lender copy (LenderMemo event or the sealed copy handed over at pledge time), with the Solana extras. */
export function openSolLenderMemo(vk: ViewingKey, memo: Uint8Array) {
  const pt = decryptMemo(vk, memo);
  if (!pt) {
    return null;
  }
  let p: SolAllowancePayload;
  try {
    p = decodePayload(pt);
  } catch {
    return null;
  }
  if (p.t !== "allow") {
    return null;
  }
  const rec = parseAllowancePayload(p);
  if (!rec.lender) {
    return null;
  }
  return { ...rec, lender: rec.lender, ...extraOf(p) };
}

// ------------------------------------------------------------------ pool client

export interface SolRelay {
  /** relayer pubkey (bound into extDataHash); its ATA receives the fee unless `feeRecipient` is given */
  relayer?: PublicKey;
  /** fee destination token account */
  feeRecipient?: PublicKey;
  fee?: bigint;
  /**
   * Hand the operation to this relayer service instead of sending it: the relayer stages the payload and
   * pays for the transactions (RelayerClient.solanaTerms gives relayer, feeRecipient and the minimum fee).
   * The wallet's signer then pays nothing: missing payout ATAs and vaults are created by the relayer.
   */
  via?: RelayerClient;
  /**
   * Capacity operator for a relayer that enforces capacity_stake: the operation is put on this wallet's
   * staked capacity (it signs capacityMessage(payload); the relayer verifies and reads its shieldCap). Only
   * needed when the public amount is above the relayer's anonymous free tier. The relayer learns the operator.
   */
  operator?: CapacityOperator;
}

export interface CapacityOperator {
  operator: PublicKey;
  /** ed25519 signature (64 bytes) by `operator` over the message */
  sign: (message: Uint8Array) => Uint8Array | Promise<Uint8Array>;
}

/** Fetches a confirmed transaction's compute units and logs (as `send` returns them). */
async function sentOf(
  connection: Connection,
  signature: string,
): Promise<SentTx> {
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

/** The relay body with the operator's signature over capacityMessage(payload) added when an operator is named. */
export async function relayBody(
  body: Omit<SolanaRelayBody, "payload">,
  payload: Uint8Array,
  operator?: CapacityOperator,
): Promise<SolanaRelayBody> {
  const out: SolanaRelayBody = { ...body, payload: toB64(payload) };
  if (operator) {
    out.operator = operator.operator.toBase58();
    out.operatorSig = toB64(await operator.sign(capacityMessage(payload)));
  }
  return out;
}

/** Sends a staged operation through a relayer and returns it as `send` would. */
export async function relayThrough(
  connection: Connection,
  via: RelayerClient,
  body: Omit<SolanaRelayBody, "payload">,
  payload: Uint8Array,
  operator?: CapacityOperator,
): Promise<SentTx> {
  const { signature } = await via.relaySolana(
    await relayBody(body, payload, operator),
  );
  return sentOf(connection, signature);
}

/** Shared access to one stipend_pool deployment: event log, token programs, vaults, buffers, clock. */
export class SolanaPool {
  readonly log: PoolEventLog;
  private tokenPrograms = new Map<string, PublicKey>();
  private vaults = new Set<string>();
  /**
   * Lookup tables for the v0 path (`useLookupTables`). Empty (the default): `run` takes the legacy path,
   * unchanged. Set: `run` plans the staging so the last chunk rides with the operation and the static
   * accounts come from the tables (alt.ts).
   */
  lookupTables: AddressLookupTableAccount[] = [];

  constructor(
    readonly connection: Connection,
    readonly programId: PublicKey = LOCALNET_POOL_PROGRAM_ID,
    readonly prover: Prover = new Prover(),
  ) {
    this.log = new PoolEventLog(connection, programId);
  }

  /** Switches `run` to v0 transactions against these lookup tables; an empty list switches back to legacy. */
  useLookupTables(tables: AddressLookupTableAccount[]): this {
    this.lookupTables = tables;
    return this;
  }

  /**
   * Creates the pool's Merkle state and deposit guard if they do not exist yet: initialize + grow_pool in one
   * transaction. `payer` must be the program's upgrade authority (the program refuses anyone else). A pool
   * account left short of full size (initialize sent without its grow_pool calls) is finished here.
   */
  async initialize(payer: Keypair, guard: DepositGuard = {}): Promise<void> {
    const info = await this.connection.getAccountInfo(
      poolPda(this.programId),
      "confirmed",
    );
    if (!info) {
      await send(
        this.connection,
        payer,
        initializePoolIxs(this.programId, payer.publicKey, guard),
        { cuLimit: POOL_INIT_CU_LIMIT },
      );
      return;
    }
    if (isPoolComplete(info.data)) {
      return;
    }
    const grows = poolGrowsNeeded(info.data.length);
    if (grows === 0) {
      throw new Error(
        "pool account is full size but has no Pool discriminator",
      );
    }
    await send(
      this.connection,
      payer,
      Array.from({ length: grows }, () =>
        growPoolIx(this.programId, payer.publicKey),
      ),
      { cuLimit: POOL_INIT_CU_LIMIT },
    );
  }

  async tokenProgramOf(mint: PublicKey): Promise<PublicKey> {
    const k = mint.toBase58();
    let tp = this.tokenPrograms.get(k);
    if (!tp) {
      const info = await this.connection.getAccountInfo(mint, "confirmed");
      if (!info) {
        throw new Error(`mint ${k} not found`);
      }
      if (
        !info.owner.equals(TOKEN_PROGRAM_ID) &&
        !info.owner.equals(TOKEN_2022_PROGRAM_ID)
      ) {
        throw new Error("not an SPL Token / Token-2022 mint");
      }
      tp = info.owner;
      this.tokenPrograms.set(k, tp);
    }
    return tp;
  }

  ata(mint: PublicKey, owner: PublicKey, tokenProgram: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(mint, owner, true, tokenProgram);
  }

  /**
   * Public payouts (withdraw, pay to a Solana key) go to the recipient's associated token account, and only
   * the recipient's signature can move them out. Off-curve recipients (PDAs) are refused unless this is set:
   * a PDA's program may sign for it, but often nothing ever will.
   */
  allowOffCurveRecipients = false;

  /**
   * Refuses a public recipient that could never move a payout out of its associated token account: a token
   * account or mint (an exchange deposit address is often a token account), a program, or, unless
   * `allowOffCurve` (default `allowOffCurveRecipients`), an off-curve address. Read only.
   */
  async checkRecipient(
    recipient: PublicKey,
    opts: { allowOffCurve?: boolean } = {},
  ): Promise<void> {
    const info = await this.connection.getAccountInfo(recipient, "confirmed");
    const k = recipient.toBase58();
    if (
      info &&
      (info.owner.equals(TOKEN_PROGRAM_ID) ||
        info.owner.equals(TOKEN_2022_PROGRAM_ID))
    ) {
      throw new Error(
        `recipient ${k} is a token account or mint, not a wallet: a payout to it could never be moved. Use the wallet address that owns it.`,
      );
    }
    if (info?.executable) {
      throw new Error(`recipient ${k} is a program, not a wallet`);
    }
    if (
      !PublicKey.isOnCurve(recipient.toBytes()) &&
      !(opts.allowOffCurve ?? this.allowOffCurveRecipients)
    ) {
      throw new Error(
        `recipient ${k} is a program-derived address (no private key): a payout to it may never be movable`,
      );
    }
  }

  /** The owner's associated token account for `mint`, created (idempotently, paid by `payer`) when missing. */
  async ensureAta(
    payer: Keypair,
    mint: PublicKey,
    owner: PublicKey,
  ): Promise<PublicKey> {
    const tp = await this.tokenProgramOf(mint);
    const ata = this.ata(mint, owner, tp);
    if (!(await this.connection.getAccountInfo(ata, "confirmed"))) {
      await send(this.connection, payer, [
        createAssociatedTokenAccountIdempotentInstruction(
          payer.publicKey,
          ata,
          owner,
          mint,
          tp,
        ),
      ]);
    }
    return ata;
  }

  /** Creates the mint's vault (permissionless, once per mint) when missing. */
  async ensureVault(payer: Keypair, mint: PublicKey): Promise<PublicKey> {
    const vault = vaultPda(this.programId, mint);
    if (this.vaults.has(vault.toBase58())) {
      return vault;
    }
    if (!(await this.connection.getAccountInfo(vault, "confirmed"))) {
      await send(this.connection, payer, [
        createVaultIx(
          this.programId,
          payer.publicKey,
          mint,
          await this.tokenProgramOf(mint),
        ),
      ]);
    }
    this.vaults.add(vault.toBase58());
    return vault;
  }

  /** Token balance of a token account (0 when it does not exist). */
  async tokenBalance(tokenAccount: PublicKey): Promise<bigint> {
    const info = await this.connection.getAccountInfo(
      tokenAccount,
      "confirmed",
    );
    if (!info) {
      return 0n;
    }
    return unpackAccount(tokenAccount, info, info.owner).amount;
  }

  /**
   * A token account that can receive (exists, initialized, not frozen and, when given, of `mint` and owned
   * by `owner`); undefined otherwise. Extensions that make an incoming CPI transfer fail (Token-2022
   * required memos and the like) are not detected here: `run` falls back to the escrow for those.
   */
  async receivable(
    tokenAccount: PublicKey,
    expect: { mint?: PublicKey; owner?: PublicKey } = {},
  ): Promise<PublicKey | undefined> {
    const info = await this.connection.getAccountInfo(
      tokenAccount,
      "confirmed",
    );
    if (!info) {
      return undefined;
    }
    try {
      const acc = unpackAccount(tokenAccount, info, info.owner);
      if (acc.isFrozen) {
        return undefined;
      }
      if (expect.mint && !acc.mint.equals(expect.mint)) {
        return undefined;
      }
      if (expect.owner && !acc.owner.equals(expect.owner)) {
        return undefined;
      }
      return tokenAccount;
    } catch {
      return undefined;
    }
  }

  /** The chain's `now` (Clock sysvar unix_timestamp). */
  async now(): Promise<bigint> {
    const info = await this.connection.getAccountInfo(
      SYSVAR_CLOCK_PUBKEY,
      "confirmed",
    );
    if (!info) {
      throw new Error("clock sysvar not readable");
    }
    return info.data.readBigInt64LE(32);
  }

  /**
   * Stages `payload` in a fresh buffer and sends the operation built by `mk(buffer)`. The operation
   * closes the buffer; if it fails, the buffer is closed here and the error rethrown.
   *
   * `fallbacks`: other ways to build the same operation. When given, `mk` is simulated first and, if it
   * fails, the first fallback that simulates cleanly is sent instead (if none does, `mk` is sent so its
   * error surfaces). Spends use it so a lender account that cannot take a CPI transfer never blocks the
   * spend: the share goes to the escrow instead, as in StipendPool's tryTransfer.
   */
  async run(
    payer: Keypair,
    payload: Uint8Array,
    mk: (buffer: PublicKey) => TransactionInstruction,
    signers: Keypair[] = [],
    fallbacks: Array<(buffer: PublicKey) => TransactionInstruction> = [],
  ): Promise<SentTx> {
    if (this.lookupTables.length > 0) {
      return this.runV0(payer, payload, mk, signers, fallbacks);
    }
    const buf = await uploadBuffer(
      this.connection,
      this.programId,
      payer,
      payload,
    );
    try {
      let chosen = mk;
      if (
        fallbacks.length > 0 &&
        (
          await simulate(
            this.connection,
            payer,
            [mk(buf.address)],
            OP_CU_LIMIT,
            signers,
          )
        ).err !== null
      ) {
        for (const alt of fallbacks) {
          if (
            (
              await simulate(
                this.connection,
                payer,
                [alt(buf.address)],
                OP_CU_LIMIT,
                signers,
              )
            ).err === null
          ) {
            chosen = alt;
            break;
          }
        }
      }
      return await send(this.connection, payer, [chosen(buf.address)], {
        cuLimit: OP_CU_LIMIT,
        signers,
      });
    } catch (e) {
      await closeBuffer(this.connection, this.programId, payer, buf.seed).catch(
        () => undefined,
      );
      throw e;
    }
  }

  /**
   * `run` over v0 transactions (alt.ts): open + head, grows, writes sized to the limit, then the last chunk
   * and the operation in one transaction against `lookupTables`. A fallback reuses the same staging and
   * swaps only the operation instruction of the final transaction.
   */
  private async runV0(
    payer: Keypair,
    payload: Uint8Array,
    mk: (buffer: PublicKey) => TransactionInstruction,
    signers: Keypair[],
    fallbacks: Array<(buffer: PublicKey) => TransactionInstruction>,
  ): Promise<SentTx> {
    const plan = planOperation({
      programId: this.programId,
      authority: payer.publicKey,
      payload,
      op: mk,
      lookupTables: this.lookupTables,
      cuLimit: OP_CU_LIMIT,
    });
    try {
      await stagePlan(this.connection, payer, plan);
      let chosen = plan.final;
      if (
        fallbacks.length > 0 &&
        (
          await simulateV0(
            this.connection,
            payer,
            plan.final,
            this.lookupTables,
            signers,
          )
        ).err !== null
      ) {
        for (const alt of fallbacks) {
          const candidate = [...plan.final.slice(0, -1), alt(plan.buffer)];
          if (
            (
              await simulateV0(
                this.connection,
                payer,
                candidate,
                this.lookupTables,
                signers,
              )
            ).err === null
          ) {
            chosen = candidate;
            break;
          }
        }
      }
      return await sendV0(
        this.connection,
        payer,
        chosen,
        this.lookupTables,
        signers,
      );
    } catch (e) {
      await abandonPlan(this.connection, this.programId, payer, plan);
      throw e;
    }
  }

  /** Delivers an escrowed lender share (permissionless) to the lender's associated token account, the only destination the pool accepts. */
  async pullLenderShare(
    payer: Keypair,
    mint: PublicKey,
    lender: PublicKey,
    loanRef: bigint,
  ): Promise<SentTx> {
    const lenderToken = await this.ensureAta(payer, mint, lender);
    return send(this.connection, payer, [
      pullLenderShareIx(
        this.programId,
        mint,
        await this.tokenProgramOf(mint),
        fieldOf(lender),
        loanRef,
        lenderToken,
      ),
    ]);
  }

  private async check(
    payer: Keypair,
    payload: Uint8Array,
    mk: (b: PublicKey) => TransactionInstruction,
    mode: "send" | "simulate",
  ): Promise<boolean> {
    const buf = await uploadBuffer(
      this.connection,
      this.programId,
      payer,
      payload,
    );
    try {
      if (mode === "simulate") {
        return (
          (await simulate(this.connection, payer, [mk(buf.address)])).err ===
          null
        );
      }
      await send(this.connection, payer, [mk(buf.address)], {
        cuLimit: OP_CU_LIMIT,
      });
      return true;
    } catch (e) {
      if (customErrorCode(e) !== undefined) {
        return false;
      }
      throw e;
    } finally {
      await closeBuffer(this.connection, this.programId, payer, buf.seed);
    }
  }

  /** Anyone can check a disclosure on chain (known root + proof). `send` runs it as a transaction. */
  verifyDisclosure(
    payer: Keypair,
    proof: ProofResult,
    args: DiscloseArgs,
    mode: "send" | "simulate" = "send",
  ): Promise<boolean> {
    return this.check(
      payer,
      concatBytes(encodeProof(proof.proof), encodeDiscloseArgs(args)),
      (b) => verifyDisclosureIx(this.programId, b),
      mode,
    );
  }

  /** Anyone can check a stream proof on chain (known root + proof; lender and asset mapped with fieldOf). */
  verifyStream(
    payer: Keypair,
    proof: ProofResult,
    args: StreamArgs,
    mode: "send" | "simulate" = "send",
  ): Promise<boolean> {
    return this.check(
      payer,
      concatBytes(encodeProof(proof.proof), encodeStreamArgs(args)),
      (b) => verifyStreamIx(this.programId, b),
      mode,
    );
  }
}

// ------------------------------------------------------------------ wallet

export interface SolOwnedNote {
  note: Note;
  commitment: bigint;
  index: number;
  spent: boolean;
}
export interface SolOwnedAllowance {
  allowance: Allowance;
  commitment: bigint;
  index: number;
  spent: boolean;
  views: MemoViews;
  /** set when the allowance is pledged: the lender ref (field) and the lender's viewing key */
  lender?: LenderInfo;
  /** the lender's pubkey (wallet or StreamLoan slot PDA), carried in the memo */
  lenderKey?: PublicKey;
  mint?: PublicKey;
}

/** Terms of a pledge: the lender (wallet or slot PDA), its loan ref, the share and the key its memos go to. */
export interface SolPledgeTerms {
  lender: PublicKey;
  loanRef: bigint;
  pledgeBps: bigint;
  lenderViewPub: Uint8Array;
}

export interface SolGrantRequest {
  to: StipendAddress;
  amount: bigint;
  windowCap?: bigint;
  windowLen?: bigint;
  maxPerTx?: bigint;
  expiry?: bigint;
  /** allowed recipients: Solana wallets (public payouts) or Stipend addresses (shielded payouts) */
  recipients?: Array<PublicKey | StipendAddress>;
  recipientRoot?: bigint;
  streamRate?: bigint;
  streamStart?: bigint;
  pledge?: SolPledgeTerms;
}

export interface SolTxResult {
  tx: SentTx;
  proof: ProofResult;
}

/** A spend built and proven but not sent (tests replay or tamper with it). */
export interface PreparedSpend {
  payload: Uint8Array;
  accounts: Omit<SpendAccounts, "buffer">;
  args: SpendArgs;
  next: Allowance;
  proof: ProofResult;
  signers: Keypair[];
  /** set when the spend goes through a relayer service */
  via?: RelayerClient;
  /** the capacity operator named for the relay, if any */
  operator?: CapacityOperator;
}

type SubRequest = { to: StipendAddress } & Omit<SubGrant, "agentPk">;
type Origin =
  | { kind: "grant" }
  | { kind: "sub" | "residual"; parentNullifier: bigint };

export function solRecipientKey(to: PublicKey | StipendAddress): bigint {
  return to instanceof PublicKey ? addressKey(fieldOf(to)) : to.pk;
}

export function lenderInfoOf(t: SolPledgeTerms): LenderInfo {
  return {
    lenderAddr: fieldOf(t.lender),
    loanRef: t.loanRef,
    viewPub: t.lenderViewPub,
  };
}

/** Tree + event cursor shared by the wallet kinds. */
abstract class Scanner {
  readonly tree = new MerkleTree(LEVELS);
  protected cursor = 0;
  protected pending = new Map<
    number,
    { commitment: bigint; memo: Uint8Array }
  >();
  protected nullifierSet = new Set<bigint>();
  protected nullifierEvents = new Map<bigint, LocatedEvent>();

  constructor(readonly pool: SolanaPool) {}

  protected abstract onCommitment(
    commitment: bigint,
    index: number,
    memo: Uint8Array,
  ): void;
  protected onEvent(_e: LocatedEvent): void {
    // subclasses react to events here
  }
  protected async afterSync(): Promise<void> {
    // subclasses finish a sync here
  }

  async sync(): Promise<void> {
    await this.pool.log.refresh();
    const evs = this.pool.log.events;
    for (; this.cursor < evs.length; this.cursor++) {
      const e = evs[this.cursor];
      if (e.name === "NewCommitment") {
        this.pending.set(e.index, {
          commitment: e.commitment,
          memo: e.encryptedOutput,
        });
      } else if (e.name === "NewNullifier") {
        this.nullifierSet.add(e.nullifier);
        this.nullifierEvents.set(e.nullifier, e);
      }
      this.onEvent(e);
    }
    for (
      let next = this.pending.get(this.tree.size);
      next;
      next = this.pending.get(this.tree.size)
    ) {
      const index = this.tree.size;
      this.pending.delete(index);
      this.tree.insert(next.commitment);
      this.onCommitment(next.commitment, index, next.memo);
    }
    await this.afterSync();
  }

  isSpent(nullifier: bigint): boolean {
    return this.nullifierSet.has(nullifier);
  }

  /**
   * Whether the tree built from the event log is one the pool has committed: its root is in the on-chain
   * root history and it has no more leaves than the pool. False means the events (e.g. a cached
   * `PoolEventLog.snapshot` from another chain) do not belong to this pool: drop them and sync from scratch.
   * Read only.
   */
  async matchesChain(): Promise<boolean> {
    const info = await this.pool.connection.getAccountInfo(
      poolPda(this.pool.programId),
      "confirmed",
    );
    if (!info) {
      return this.tree.size === 0;
    }
    const st = decodePool(info.data);
    return this.tree.size <= st.nextIndex && st.roots.includes(this.tree.root);
  }
}

export class SolanaWallet extends Scanner {
  readonly notes = new Map<bigint, SolOwnedNote>();
  readonly allowances = new Map<bigint, SolOwnedAllowance>();
  /** mints by asset field, learned from memos and calls */
  readonly mints = new Map<bigint, PublicKey>();
  private rhos = new Set<bigint>();
  private bySuccessorRho = new Map<bigint, SolOwnedAllowance>();
  private origins = new Map<number, Origin>();
  private recipientLists = new Map<bigint, { tree: MerkleTree }>();

  /**
   * `account`: the Stipend spending/viewing keys. `signer`: the Solana keypair that pays fees, owns the
   * staging buffers and, on deposits, the source token account.
   */
  constructor(
    readonly account: Account,
    pool: SolanaPool,
    readonly signer: Keypair,
  ) {
    super(pool);
  }

  get prover(): Prover {
    return this.pool.prover;
  }
  get address(): StipendAddress {
    return this.account.address;
  }

  registerMint(mint: PublicKey): bigint {
    const f = fieldOf(mint);
    this.mints.set(f, mint);
    return f;
  }

  private mintOf(owned: SolOwnedAllowance): PublicKey {
    const m = owned.mint ?? this.mints.get(owned.allowance.asset);
    if (!m) {
      throw new Error("unknown mint for this allowance; call registerMint()");
    }
    return m;
  }

  // ---- scanning ----

  protected onEvent(e: LocatedEvent): void {
    if (e.name === "NewGrant") {
      for (let i = 0; i < GRANT_OUTPUTS; i++) {
        this.origins.set(e.firstIndex + i, { kind: "grant" });
      }
    }
    if (e.name === "NewDelegation") {
      for (let i = 0; i < DELEGATE_OUTPUTS; i++) {
        this.origins.set(e.firstIndex + i, {
          kind: "sub",
          parentNullifier: e.nullifier,
        });
      }
      this.origins.set(e.firstIndex + DELEGATE_OUTPUTS, {
        kind: "residual",
        parentNullifier: e.nullifier,
      });
    }
  }

  protected onCommitment(
    commitment: bigint,
    index: number,
    memo: Uint8Array,
  ): void {
    const candidates = memo.length > 0 ? [memo, ...unpackMemos(memo)] : [];
    for (const m of candidates) {
      const pt = decryptMemo(this.account.view, m);
      if (!pt) {
        continue;
      }
      let payload: NotePayload | SolAllowancePayload;
      try {
        payload = decodePayload(pt);
      } catch {
        continue;
      }
      if (payload.t === "note") {
        const note: Note = {
          asset: payload.asset,
          amount: payload.amount,
          pk: payload.pk,
          blinding: payload.blinding,
        };
        if (
          note.pk !== this.account.keys.pk ||
          noteCommitment(note) !== commitment
        ) {
          continue;
        }
        this.notes.set(commitment, { note, commitment, index, spent: false });
        return;
      }
      if (payload.t === "allow") {
        const {
          allowance: a,
          views,
          lender: fromMemo,
        } = parseAllowancePayload(payload);
        if (allowanceCommitment(a) !== commitment) {
          continue;
        }
        if (
          a.agentPk !== this.account.keys.pk &&
          a.policy.ownerPk !== this.account.keys.pk
        ) {
          continue;
        }
        const extra = extraOf(payload);
        const prev = this.bySuccessorRho.get(a.rho);
        // a pledge is immutable along a line: a successor memo that leaves the lender out inherits it
        const lender =
          fromMemo ?? (a.policy.pledgeBps !== 0n ? prev?.lender : undefined);
        const lenderKey =
          extra.lenderKey ??
          (a.policy.pledgeBps !== 0n ? prev?.lenderKey : undefined);
        const mint = extra.mint ?? prev?.mint ?? this.mints.get(a.asset);
        if (mint) {
          this.mints.set(a.asset, mint);
        }
        this.remember({
          allowance: a,
          commitment,
          index,
          spent: false,
          views,
          lender,
          lenderKey,
          mint,
        });
        return;
      }
    }
  }

  protected async afterSync(): Promise<void> {
    for (const n of this.notes.values()) {
      if (
        this.nullifierSet.has(noteNullifier(this.account.keys.nk, n.commitment))
      ) {
        n.spent = true;
      }
    }
    const orphans: Array<[SolOwnedAllowance, LocatedEvent]> = [];
    for (const a of this.allowances.values()) {
      if (a.spent) {
        continue;
      }
      const nf = allowanceNullifier(a.allowance.rho, a.commitment);
      if (!this.nullifierSet.has(nf)) {
        continue;
      }
      a.spent = true;
      const ev = this.nullifierEvents.get(nf);
      if (ev && !this.rhos.has(nextRho(a.allowance.rho))) {
        orphans.push([a, ev]);
      }
    }
    for (const [a, ev] of orphans) {
      this.recoverSuccessor(a, ev);
    }
  }

  /**
   * A spent allowance whose successor no memo revealed (a lender claim with a blank memo): the successor
   * is fixed by public data, `remaining - lenderAmount`, `pledgePaid + lenderAmount`, window kept,
   * rho' = nextRho(rho). Rebuild it from the same transaction's events and keep it when its commitment is
   * the one the pool inserted.
   */
  private recoverSuccessor(spent: SolOwnedAllowance, ev: LocatedEvent): void {
    const evs = (this.pool.log.byTx.get(ev.signature) ?? []).filter(
      (e) => e.seq > ev.seq,
    );
    const successor = evs.find((e) => e.name === "NewCommitment");
    const routed = evs.find(
      (e) =>
        e.name === "PledgeRouted" &&
        e.nullifier === (ev as { nullifier: bigint }).nullifier,
    );
    if (
      !successor ||
      successor.name !== "NewCommitment" ||
      !routed ||
      routed.name !== "PledgeRouted"
    ) {
      return;
    }
    const next = spendAllowance(
      spent.allowance,
      routed.amount,
      0n,
      false,
      true,
    );
    if (allowanceCommitment(next) !== successor.commitment) {
      return;
    }
    const nf = allowanceNullifier(next.rho, successor.commitment);
    const owned: SolOwnedAllowance = {
      ...spent,
      allowance: next,
      commitment: successor.commitment,
      index: successor.index,
      spent: this.nullifierSet.has(nf),
    };
    this.remember(owned);
    const nextEv = this.nullifierEvents.get(nf);
    if (owned.spent && nextEv && !this.rhos.has(nextRho(next.rho))) {
      this.recoverSuccessor(owned, nextEv);
    }
  }

  private remember(owned: SolOwnedAllowance): void {
    this.allowances.set(owned.commitment, owned);
    this.rhos.add(owned.allowance.rho);
    this.bySuccessorRho.set(nextRho(owned.allowance.rho), owned);
  }

  unspentNotes(mint: PublicKey | bigint): SolOwnedNote[] {
    const asset = mint instanceof PublicKey ? fieldOf(mint) : mint;
    return [...this.notes.values()]
      .filter((n) => !n.spent && n.note.asset === asset && n.note.amount > 0n)
      .sort((a, b) => (a.note.amount > b.note.amount ? -1 : 1));
  }

  balance(mint: PublicKey | bigint): bigint {
    return this.unspentNotes(mint).reduce((s, n) => s + n.note.amount, 0n);
  }

  agentAllowances(mint?: PublicKey): SolOwnedAllowance[] {
    const asset = mint ? fieldOf(mint) : undefined;
    return [...this.allowances.values()].filter(
      (a) =>
        !a.spent &&
        a.allowance.agentPk === this.account.keys.pk &&
        (asset === undefined || a.allowance.asset === asset),
    );
  }

  grantedAllowances(): SolOwnedAllowance[] {
    return [...this.allowances.values()].filter(
      (a) => !a.spent && a.allowance.policy.ownerPk === this.account.keys.pk,
    );
  }

  /** The owner's treasury as a tree of lines (a note and its successors) with the lines delegated from them. */
  treasuryTree(): TreasuryNode[] {
    const mine = [...this.allowances.values()]
      .filter((a) => a.allowance.policy.ownerPk === this.account.keys.pk)
      .sort((a, b) => a.index - b.index);
    const byRho = new Map(mine.map((a) => [a.allowance.rho, a]));
    const successorRhos = new Set(mine.map((a) => nextRho(a.allowance.rho)));
    const heads = mine.filter((a) => !successorRhos.has(a.allowance.rho));
    const lineOfNullifier = new Map<bigint, TreasuryNode>();
    const nodes: Array<{ head: SolOwnedAllowance; node: TreasuryNode }> = [];
    for (const head of heads) {
      const line: SolOwnedAllowance[] = [head];
      for (
        let next = byRho.get(nextRho(head.allowance.rho));
        next;
        next = byRho.get(nextRho(next.allowance.rho))
      ) {
        line.push(next);
      }
      const last = line[line.length - 1];
      const node: TreasuryNode = {
        allowance: last.allowance,
        commitment: last.commitment,
        index: last.index,
        spent: last.spent,
        granted: head.allowance,
        children: [],
      };
      for (const n of line) {
        lineOfNullifier.set(
          allowanceNullifier(n.allowance.rho, n.commitment),
          node,
        );
      }
      nodes.push({ head, node });
    }
    const roots: TreasuryNode[] = [];
    for (const { head, node } of nodes) {
      const origin = this.origins.get(head.index);
      const parent =
        origin?.kind === "sub"
          ? lineOfNullifier.get(origin.parentNullifier)
          : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  // ---- treasury ----

  private pickInputs(asset: bigint, needed: bigint): [NoteInput, NoteInput] {
    const chosen = selectNotes(
      this.unspentNotes(asset),
      (n) => n.note.amount,
      needed,
    );
    if (chosen.length > MAX_INPUTS) {
      throw new Error("consolidate notes first (more than two inputs needed)");
    }
    const toInput = (n: SolOwnedNote): NoteInput => ({
      note: n.note,
      keys: this.account.keys,
      path: this.tree.path(n.index),
    });
    return [
      chosen[0]
        ? toInput(chosen[0])
        : dummyNoteInput(asset, this.account.keys, this.tree),
      chosen[1]
        ? toInput(chosen[1])
        : dummyNoteInput(asset, this.account.keys, this.tree),
    ];
  }

  /**
   * Merge notes until at most `maxInputs` (1 or 2) of them cover `needed` (default: the whole balance), with
   * fully shielded 2-in-2-out transfers to this account (the two smallest selected notes in; their sum and a
   * zero note out). Returns one result per merge. transfer, withdraw and grant call it themselves.
   */
  async consolidate(
    mint: PublicKey,
    needed?: bigint,
    maxInputs = MAX_INPUTS,
  ): Promise<SolTxResult[]> {
    await this.sync();
    const asset = this.registerMint(mint);
    const target = needed ?? this.balance(asset);
    const done: SolTxResult[] = [];
    for (
      let pair = nextMerge(
        this.unspentNotes(asset),
        (n) => n.note.amount,
        target,
        maxInputs,
      );
      pair;
      pair = nextMerge(
        this.unspentNotes(asset),
        (n) => n.note.amount,
        target,
        maxInputs,
      )
    ) {
      const toInput = (n: SolOwnedNote): NoteInput => ({
        note: n.note,
        keys: this.account.keys,
        path: this.tree.path(n.index),
      });
      const outputs: [Note, Note] = [
        {
          asset,
          amount: pair[0].note.amount + pair[1].note.amount,
          pk: this.account.keys.pk,
          blinding: randomField(),
        },
        {
          asset,
          amount: 0n,
          pk: this.account.keys.pk,
          blinding: randomField(),
        },
      ];
      done.push(
        await this.transact(
          mint,
          [toInput(pair[0]), toInput(pair[1])],
          outputs,
          [this.account.view.pub, this.account.view.pub],
          0n,
          {},
        ),
      );
    }
    return done;
  }

  private async feeToken(
    mint: PublicKey,
    relay: SolRelay,
  ): Promise<PublicKey | undefined> {
    if (!relay.fee) {
      return undefined;
    }
    if (relay.via && !relay.feeRecipient) {
      if (!relay.relayer) {
        throw new Error(
          "relay.via needs relay.relayer (RelayerClient.solanaTerms)",
        );
      }
      return this.pool.ata(
        mint,
        relay.relayer,
        await this.pool.tokenProgramOf(mint),
      );
    }
    return (
      relay.feeRecipient ??
      this.pool.ensureAta(
        this.signer,
        mint,
        relay.relayer ?? this.signer.publicKey,
      )
    );
  }

  private async transact(
    mint: PublicKey,
    inputs: [NoteInput, NoteInput],
    outputs: [Note, Note],
    views: [Uint8Array, Uint8Array],
    extAmount: bigint,
    relay: SolRelay,
    recipientToken?: PublicKey,
    recipientOwner?: PublicKey,
  ): Promise<SolTxResult> {
    const asset = this.registerMint(mint);
    const fee = relay.fee ?? 0n;
    const moves = extAmount !== 0n || fee !== 0n;
    const feeToken = await this.feeToken(mint, relay);
    const ext = {
      recipient: recipientToken ?? DEFAULT_PUBKEY,
      relayer: relay.relayer ?? DEFAULT_PUBKEY,
      feeRecipient: feeToken ?? DEFAULT_PUBKEY,
      extAmount,
      fee,
      encryptedOutputs: [
        noteMemo(outputs[0], views[0]),
        noteMemo(outputs[1], views[1]),
      ] as [Uint8Array, Uint8Array],
    };
    const extBytes = encodeTransactExt(ext);
    const h = extDataHash(extBytes);
    const root = this.tree.root;
    const built = transactInput({
      root,
      asset,
      inputs,
      outputs,
      publicAmount: extAmount - fee,
      extDataHash: h,
    });
    const proof = await this.prover.prove("transact", built.input);
    const nullifiers = built.inputNullifier as [bigint, bigint];
    const payload = concatBytes(
      encodeProof(proof.proof),
      encodeTransactArgs({
        root,
        publicAmount: built.publicAmount,
        extDataHash: h,
        inputNullifiers: nullifiers,
        outputCommitments: built.outputCommitment as [bigint, bigint],
      }),
      extBytes,
    );
    const token = moves
      ? { mint, tokenProgram: await this.pool.tokenProgramOf(mint) }
      : undefined;
    if (relay.via) {
      if (extAmount > 0n) {
        throw new Error(
          "a deposit cannot be relayed: the depositor signs the token transfer",
        );
      }
      const tx = await relayThrough(
        this.pool.connection,
        relay.via,
        {
          op: "transact",
          mint: mint.toBase58(),
          recipientOwner: recipientOwner?.toBase58(),
        },
        payload,
        relay.operator,
      );
      await this.sync();
      return { tx, proof };
    }
    if (moves) {
      await this.pool.ensureVault(this.signer, mint);
    }
    const depositorToken =
      extAmount > 0n
        ? this.pool.ata(mint, this.signer.publicKey, token!.tokenProgram)
        : undefined;
    const tx = await this.pool.run(this.signer, payload, (buffer) =>
      transactIx(this.pool.programId, {
        payer: this.signer.publicKey,
        buffer,
        nullifiers,
        token,
        depositorToken,
        recipientToken,
        feeToken,
      }),
    );
    await this.sync();
    return { tx, proof };
  }

  /** Shield `amount` of `mint` from the signer's associated token account. The relayer fee comes out of the deposit. */
  async deposit(
    mint: PublicKey,
    amount: bigint,
    relay: SolRelay = {},
  ): Promise<SolTxResult> {
    await this.sync();
    const asset = this.registerMint(mint);
    const fee = relay.fee ?? 0n;
    const outputs: [Note, Note] = [
      {
        asset,
        amount: amount - fee,
        pk: this.account.keys.pk,
        blinding: randomField(),
      },
      { asset, amount: 0n, pk: this.account.keys.pk, blinding: randomField() },
    ];
    const inputs: [NoteInput, NoteInput] = [
      dummyNoteInput(asset, this.account.keys, this.tree),
      dummyNoteInput(asset, this.account.keys, this.tree),
    ];
    return this.transact(
      mint,
      inputs,
      outputs,
      [this.account.view.pub, this.account.view.pub],
      amount,
      relay,
    );
  }

  /** Fully shielded transfer to another Stipend address; the mint is not revealed. */
  async transfer(
    mint: PublicKey,
    amount: bigint,
    to: StipendAddress,
  ): Promise<SolTxResult> {
    await this.sync();
    const asset = this.registerMint(mint);
    await this.consolidate(mint, amount);
    const inputs = this.pickInputs(asset, amount);
    const sum = inputs[0].note.amount + inputs[1].note.amount;
    const outputs: [Note, Note] = [
      { asset, amount, pk: to.pk, blinding: randomField() },
      {
        asset,
        amount: sum - amount,
        pk: this.account.keys.pk,
        blinding: randomField(),
      },
    ];
    return this.transact(
      mint,
      inputs,
      outputs,
      [to.viewPub, this.account.view.pub],
      0n,
      {},
    );
  }

  /** Unshield: `amount` leaves the pool to `recipient`'s associated token account; it gets amount - fee. */
  async withdraw(
    mint: PublicKey,
    amount: bigint,
    recipient: PublicKey,
    relay: SolRelay = {},
  ): Promise<SolTxResult> {
    await this.pool.checkRecipient(recipient);
    await this.sync();
    const asset = this.registerMint(mint);
    const fee = relay.fee ?? 0n;
    await this.consolidate(mint, amount);
    const inputs = this.pickInputs(asset, amount);
    const sum = inputs[0].note.amount + inputs[1].note.amount;
    const outputs: [Note, Note] = [
      {
        asset,
        amount: sum - amount,
        pk: this.account.keys.pk,
        blinding: randomField(),
      },
      { asset, amount: 0n, pk: this.account.keys.pk, blinding: randomField() },
    ];
    const recipientToken = relay.via
      ? this.pool.ata(mint, recipient, await this.pool.tokenProgramOf(mint)) // the relayer creates it when missing
      : await this.pool.ensureAta(this.signer, mint, recipient);
    return this.transact(
      mint,
      inputs,
      outputs,
      [this.account.view.pub, this.account.view.pub],
      -(amount - fee),
      relay,
      recipientToken,
      recipient,
    );
  }

  // ---- distribution ----

  /** Fund up to sixteen agents in one transaction, each under its own policy. */
  async grant(
    mint: PublicKey,
    requests: SolGrantRequest[],
  ): Promise<
    SolTxResult & {
      allowances: Allowance[];
      total: bigint;
      totalSalt: bigint;
      lenderPayloads: Array<LenderPayload | undefined>;
    }
  > {
    if (requests.length === 0 || requests.length > GRANT_OUTPUTS) {
      throw new Error(`1..${GRANT_OUTPUTS} grants per transaction`);
    }
    await this.sync();
    const asset = this.registerMint(mint);
    const total = requests.reduce((s, r) => s + r.amount, 0n);
    await this.consolidate(mint, total);
    const inputs = this.pickInputs(asset, total);
    const sum = inputs[0].note.amount + inputs[1].note.amount;
    const now = requests.some((r) => r.streamRate) ? await this.pool.now() : 0n;
    const lenders = requests.map((r) =>
      r.pledge ? lenderInfoOf(r.pledge) : undefined,
    );
    const allowances: Allowance[] = requests.map((r, i) => ({
      asset,
      remaining: r.amount,
      agentPk: r.to.pk,
      windowId: 0n,
      windowSpent: 0n,
      rho: randomField(),
      pledgePaid: 0n,
      policy: {
        lifetimeCap: r.amount,
        windowCap: r.windowCap ?? 0n,
        windowLen: r.windowLen ?? 86400n,
        maxPerTx: r.maxPerTx ?? 0n,
        expiry: r.expiry ?? 0n,
        recipientRoot: r.recipients?.length
          ? recipientListRoot(
              r.recipients.map(solRecipientKey),
              RECIPIENT_LEVELS,
            ).root
          : (r.recipientRoot ?? 0n),
        ownerPk: this.account.keys.pk,
        streamRate: r.streamRate ?? 0n,
        streamStart: r.streamRate ? (r.streamStart ?? now) : 0n,
        lender: lenders[i]
          ? lenderKey(lenders[i]!.lenderAddr, lenders[i]!.loanRef)
          : 0n,
        pledgeBps: r.pledge?.pledgeBps ?? 0n,
      },
    }));
    const change: Note = {
      asset,
      amount: sum - total,
      pk: this.account.keys.pk,
      blinding: randomField(),
    };
    const totalSalt = randomField();
    const base = {
      root: this.tree.root,
      asset,
      owner: this.account.keys,
      inputs,
      allowances,
      lenders,
      change,
      totalSalt,
    };
    const built = grantInput({ ...base, extDataHash: 0n });
    const views = (i: number): MemoViews => ({
      owner: this.account.view.pub,
      agent: requests[i].to.viewPub,
    });
    const extra = (i: number): SolMemoExtra => ({
      mint,
      lenderKey: requests[i].pledge?.lender,
    });
    const memos = built.allowances.map((a, i) =>
      requests[i]
        ? solAllowanceMemo(a, views(i), lenders[i], extra(i))
        : new Uint8Array(),
    );
    const extBytes = encodeGrantExt({
      encryptedAllowances: memos,
      encryptedChange: noteMemo(change, this.account.view.pub),
    });
    const h = extDataHash(extBytes);
    const rebuilt = grantInput({
      ...base,
      allowances: built.allowances,
      extDataHash: h,
    });
    const proof = await this.prover.prove("grant", rebuilt.input);
    const nullifiers = rebuilt.inputNullifier as [bigint, bigint];
    const payload = concatBytes(
      encodeProof(proof.proof),
      encodeGrantArgs({
        root: base.root,
        inputNullifiers: nullifiers,
        allowanceCommitments: rebuilt.allowanceCommitments,
        changeCommitment: rebuilt.changeCommitment,
        totalCommitment: rebuilt.totalCommitment,
        extDataHash: h,
      }),
      extBytes,
    );
    const tx = await this.pool.run(this.signer, payload, (buffer) =>
      grantIx(this.pool.programId, this.signer.publicKey, buffer, nullifiers),
    );
    await this.sync();
    const lenderPayloads = allowances.map((a, i) =>
      lenders[i]
        ? solSealForLender(a, views(i), lenders[i]!, extra(i))
        : undefined,
    );
    return { tx, proof, allowances, total, totalSalt, lenderPayloads };
  }

  // ---- spending ----

  /** Pay from an allowance: `to` is a Solana wallet (public payout to its associated token account) or a Stipend address (shielded). */
  async pay(
    owned: SolOwnedAllowance,
    amount: bigint,
    to: PublicKey | StipendAddress,
    relay: SolRelay = {},
  ): Promise<SolTxResult & { next: Allowance }> {
    const p = await this.prepareSpend(owned, amount, to, relay);
    return this.submitSpend(p);
  }

  /** Owner takes back what is left of an allowance into their own treasury; a pledged share is still routed. */
  async reclaim(
    owned: SolOwnedAllowance,
  ): Promise<SolTxResult & { next: Allowance }> {
    if (owned.allowance.policy.ownerPk !== this.account.keys.pk) {
      throw new Error("not the owner");
    }
    return this.pay(owned, owned.allowance.remaining, this.account.address);
  }

  /** Builds and proves a spend without sending it. `now` defaults to the chain clock. */
  async prepareSpend(
    owned: SolOwnedAllowance,
    amount: bigint,
    to: PublicKey | StipendAddress,
    relay: SolRelay = {},
    opts: { now?: bigint } = {},
  ): Promise<PreparedSpend> {
    if (to instanceof PublicKey) {
      await this.pool.checkRecipient(to);
    }
    await this.sync();
    const a = owned.allowance;
    if (a.policy.pledgeBps !== 0n && !owned.lender) {
      throw new Error("pledged allowance without its lender info");
    }
    const mint = this.mintOf(owned);
    const isPublic = to instanceof PublicKey;
    const now = opts.now ?? (await this.pool.now());
    const isAgent = a.agentPk === this.account.keys.pk;
    const recipientPath =
      a.policy.recipientRoot !== 0n && isAgent
        ? this.recipientPath(owned, to)
        : undefined;
    const payBlinding = randomField();
    const base = {
      root: this.tree.root,
      allowance: a,
      path: this.tree.path(owned.index),
      spender: this.account.keys,
      amount,
      now,
      fee: relay.fee,
      ...(isPublic
        ? { publicTo: fieldOf(to) }
        : { shieldedTo: { pk: to.pk, blinding: payBlinding } }),
      recipientPath,
      lender: owned.lender as LenderRef | undefined,
    };
    const draft = spendInput({ ...base, extDataHash: 0n });
    const tokenProgram = await this.pool.tokenProgramOf(mint);
    const feeToken = isPublic ? await this.feeToken(mint, relay) : undefined;
    const extra = { mint, lenderKey: owned.lenderKey };
    const extBytes = encodeSpendExt({
      relayer: relay.relayer ?? DEFAULT_PUBKEY,
      feeRecipient: feeToken ?? DEFAULT_PUBKEY,
      encryptedAllowance: solAllowanceMemo(
        draft.next,
        owned.views,
        owned.lender,
        extra,
      ),
      encryptedPayment: isPublic
        ? new Uint8Array()
        : noteMemo(draft.payNote, to.viewPub),
      encryptedLender: owned.lender
        ? solSealForLender(draft.next, owned.views, owned.lender, extra)
        : new Uint8Array(),
    });
    const h = extDataHash(extBytes);
    const built = spendInput({ ...base, extDataHash: h });
    const proof = await this.prover.prove("spend", built.input);
    const args: SpendArgs = {
      root: base.root,
      nullifier: built.nullifier,
      newAllowanceCommitment: built.newAllowanceCommitment,
      payCommitment: built.payCommitment,
      publicAmount: built.isPublic ? built.net : 0n,
      publicRecipient: isPublic ? to : DEFAULT_PUBKEY,
      publicAsset: built.publicAsset === 0n ? DEFAULT_PUBKEY : mint,
      fee: built.fee,
      timestamp: now,
      receipt: built.receipt,
      lenderAmount: built.lenderAmount,
      lenderAddr: built.input.lenderAddr as bigint,
      loanRef: built.input.loanRef as bigint,
      isLenderClaim: false,
      extDataHash: h,
    };
    const accounts: Omit<SpendAccounts, "buffer"> = {
      payer: this.signer.publicKey,
      nullifier: built.nullifier,
    };
    if (built.publicAsset !== 0n) {
      accounts.token = { mint, tokenProgram };
      if (!relay.via) {
        await this.pool.ensureVault(this.signer, mint);
      }
    }
    if (isPublic && built.net > 0n) {
      accounts.recipientToken = relay.via
        ? this.pool.ata(mint, to, tokenProgram)
        : await this.pool.ensureAta(this.signer, mint, to);
      accounts.feeToken = feeToken;
    }
    if (built.lenderAmount > 0n) {
      accounts.escrow = { lenderAddr: args.lenderAddr, loanRef: args.loanRef };
      if (owned.lenderKey) {
        accounts.lenderToken = await this.pool.receivable(
          this.pool.ata(mint, owned.lenderKey, tokenProgram),
          { mint, owner: owned.lenderKey },
        );
      }
    }
    const payload = concatBytes(
      encodeProof(proof.proof),
      encodeSpendArgs(args),
      extBytes,
    );
    return {
      payload,
      accounts,
      args,
      next: built.next,
      proof,
      signers: [],
      via: relay.via,
      operator: relay.operator,
    };
  }

  /** Sends a prepared spend. If the lender's account cannot take the share, the spend goes through with the share escrowed. */
  async submitSpend(
    p: PreparedSpend,
  ): Promise<SolTxResult & { next: Allowance }> {
    if (p.via) {
      const tx = await relayThrough(
        this.pool.connection,
        p.via,
        { op: "spend", lenderToken: p.accounts.lenderToken?.toBase58() },
        p.payload,
        p.operator,
      );
      await this.sync();
      return { tx, proof: p.proof, next: p.next };
    }
    const fallbacks =
      p.accounts.lenderToken && !p.args.isLenderClaim
        ? [
            (buffer: PublicKey) =>
              spendIx(this.pool.programId, {
                ...p.accounts,
                lenderToken: undefined,
                buffer,
              }),
          ]
        : [];
    const tx = await this.pool.run(
      this.signer,
      p.payload,
      (buffer) => spendIx(this.pool.programId, { ...p.accounts, buffer }),
      p.signers,
      fallbacks,
    );
    await this.sync();
    return { tx, proof: p.proof, next: p.next };
  }

  private recipientPath(
    owned: SolOwnedAllowance,
    to: PublicKey | StipendAddress,
  ): MerklePath {
    const known = this.recipientLists.get(owned.allowance.policy.recipientRoot);
    if (!known) {
      throw new Error(
        "allow-list for this allowance is unknown; call rememberRecipients()",
      );
    }
    const idx = known.tree.indexOf(solRecipientKey(to));
    if (idx < 0) {
      throw new Error("recipient is not on the allow-list");
    }
    return known.tree.path(idx);
  }

  /** Register an allow-list so spends can prove membership against it. */
  rememberRecipients(recipients: Array<PublicKey | StipendAddress>): bigint {
    const { root, tree } = recipientListRoot(
      recipients.map(solRecipientKey),
      RECIPIENT_LEVELS,
    );
    this.recipientLists.set(root, { tree });
    return root;
  }

  // ---- delegation ----

  /**
   * Split an allowance held as the agent into sub-allowances under no looser policy, keeping the rest. Up to
   * four subs take one transaction; more are delegated in a chain of steps of four, each from the previous
   * step's residual (src/delegation.ts). The chain is checked before the first transaction but is not atomic.
   */
  async delegate(
    owned: SolOwnedAllowance,
    subs: SubRequest[],
    opts: {
      residualWindowCap?: bigint;
      residualStreamRate?: bigint;
      now?: bigint;
    } = {},
  ): Promise<
    SolTxResult & {
      subs: Allowance[];
      residual: Allowance;
      steps: SolTxResult[];
    }
  > {
    if (owned.allowance.agentPk !== this.account.keys.pk) {
      throw new Error("only the agent can delegate");
    }
    if (subs.length === 0) {
      throw new Error("at least one sub");
    }
    if (subs.length <= DELEGATE_OUTPUTS) {
      const one = await this.delegateOnce(owned, subs, opts);
      return { ...one, steps: [{ tx: one.tx, proof: one.proof }] };
    }
    if (owned.allowance.policy.pledgeBps !== 0n && !owned.lender) {
      throw new Error("pledged allowance without its lender info");
    }
    await this.sync();
    const { now: nowOpt, ...residualOpts } = opts;
    const now = nowOpt ?? (await this.pool.now());
    const plan = planDelegation(
      owned.allowance,
      subs.map((s) => ({ ...s, agentPk: s.to.pk })),
      {
        ...residualOpts,
        now,
        lender: owned.lender as LenderRef | undefined,
        agent: this.account.keys,
        path: this.tree.path(owned.index),
      },
    );
    const steps: SolTxResult[] = [];
    const made: Allowance[] = [];
    let current = owned;
    let at = 0;
    let residual = owned.allowance;
    for (const step of plan.steps) {
      const chunk = subs
        .slice(at, at + step.subs.length)
        .map((s, i) => ({ ...s, ...step.subs[i], to: s.to }));
      at += step.subs.length;
      const res = await this.delegateOnce(current, chunk, {
        residualWindowCap: step.residualWindowCap,
        residualStreamRate: step.residualStreamRate,
        now: nowOpt,
      });
      steps.push({ tx: res.tx, proof: res.proof });
      made.push(...res.subs);
      residual = res.residual;
      const next = this.allowances.get(allowanceCommitment(res.residual));
      if (!next) {
        throw new Error("residual not found after sync");
      }
      current = next;
    }
    const last = steps[steps.length - 1];
    return { tx: last.tx, proof: last.proof, subs: made, residual, steps };
  }

  private async delegateOnce(
    owned: SolOwnedAllowance,
    subs: SubRequest[],
    opts: {
      residualWindowCap?: bigint;
      residualStreamRate?: bigint;
      now?: bigint;
    } = {},
  ): Promise<SolTxResult & { subs: Allowance[]; residual: Allowance }> {
    if (subs.length === 0 || subs.length > DELEGATE_OUTPUTS) {
      throw new Error(`1..${DELEGATE_OUTPUTS} subs per delegation`);
    }
    const parentPledged = owned.allowance.policy.pledgeBps !== 0n;
    if (parentPledged && !owned.lender) {
      throw new Error("pledged allowance without its lender info");
    }
    await this.sync();
    const mint = this.mintOf(owned);
    const { now: nowOpt, ...residualOpts } = opts;
    const now = nowOpt ?? (await this.pool.now());
    const extra = { mint, lenderKey: owned.lenderKey };
    const base = {
      root: this.tree.root,
      allowance: owned.allowance,
      path: this.tree.path(owned.index),
      agent: this.account.keys,
      now,
      subs: subs.map((s) => ({ ...s, agentPk: s.to.pk })),
      lender: owned.lender as LenderRef | undefined,
      ...residualOpts,
    };
    const draft = delegateInput({ ...base, extDataHash: 0n });
    const extBytes = encodeDelegateExt({
      encryptedSubs: draft.subs.map((a, i) =>
        subs[i]
          ? solAllowanceMemo(
              a,
              { owner: owned.views.owner, agent: subs[i].to.viewPub },
              parentPledged ? owned.lender : undefined,
              extra,
            )
          : new Uint8Array(),
      ),
      encryptedResidual: solAllowanceMemo(
        draft.residual,
        owned.views,
        owned.lender,
        extra,
      ),
    });
    const h = extDataHash(extBytes);
    // delegateInput draws fresh rho per call; pin the draft's notes so memos and commitments agree
    const built = delegateInput({ ...base, extDataHash: h });
    const input = {
      ...built.input,
      subRho: draft.subs.map((s) => s.rho),
      subAgentPk: draft.subs.map((s) => s.agentPk),
      subCommitment: draft.subCommitments,
    };
    const proof = await this.prover.prove("delegate", input);
    const payload = concatBytes(
      encodeProof(proof.proof),
      encodeDelegateArgs({
        root: base.root,
        nullifier: built.nullifier,
        subCommitments: draft.subCommitments,
        residualCommitment: built.residualCommitment,
        timestamp: now,
        extDataHash: h,
      }),
      extBytes,
    );
    const tx = await this.pool.run(this.signer, payload, (buffer) =>
      delegateIx(
        this.pool.programId,
        this.signer.publicKey,
        buffer,
        built.nullifier,
      ),
    );
    await this.sync();
    return {
      tx,
      proof,
      subs: draft.subs.slice(0, subs.length),
      residual: built.residual,
    };
  }

  /** Hand an allowance to another agent as a bearer note (the whole balance under the same policy). */
  async transferAllowance(
    owned: SolOwnedAllowance,
    to: StipendAddress,
  ): Promise<SolTxResult & { allowance: Allowance }> {
    if (owned.allowance.agentPk !== this.account.keys.pk) {
      throw new Error("only the agent can move an allowance");
    }
    if (owned.allowance.remaining === 0n) {
      throw new Error("nothing left to move");
    }
    const P = owned.allowance.policy;
    const slots = BigInt(DELEGATE_OUTPUTS - 1);
    const windowCap = P.windowCap === 0n ? undefined : P.windowCap - slots;
    const streamRate = P.streamRate === 0n ? undefined : P.streamRate - slots;
    if (windowCap !== undefined && windowCap <= 0n) {
      throw new Error("window cap too small to move");
    }
    if (streamRate !== undefined && streamRate <= 0n) {
      throw new Error("stream rate too small to move");
    }
    const res = await this.delegate(owned, [
      { to, amount: owned.allowance.remaining, windowCap, streamRate },
    ]);
    return { tx: res.tx, proof: res.proof, allowance: res.subs[0] };
  }

  /**
   * Pledge an allowance this account granted: reclaim what is left and grant it again to the same agent
   * under the same rules plus the pledge (two transactions). Only the owner can create a pledge.
   */
  async pledge(
    owned: SolOwnedAllowance,
    terms: SolPledgeTerms,
    opts: { streamStart?: bigint } = {},
  ): Promise<
    SolTxResult & {
      allowance: Allowance;
      owned: SolOwnedAllowance;
      payload: LenderPayload;
      lender: LenderInfo;
    }
  > {
    if (owned.allowance.policy.ownerPk !== this.account.keys.pk) {
      throw new Error("only the owner can pledge an allowance");
    }
    if (owned.allowance.policy.pledgeBps !== 0n) {
      throw new Error(
        "a pledge is immutable: the allowance is already pledged",
      );
    }
    if (terms.pledgeBps <= 0n || terms.pledgeBps > 10000n) {
      throw new Error("pledgeBps must be 1..10000");
    }
    const a = owned.allowance;
    if (a.remaining === 0n) {
      throw new Error("nothing left to pledge");
    }
    const P = a.policy;
    const mint = this.mintOf(owned);
    await this.reclaim(owned);
    const res = await this.grant(mint, [
      {
        to: { pk: a.agentPk, viewPub: owned.views.agent },
        amount: a.remaining,
        windowCap: P.windowCap,
        windowLen: P.windowLen,
        maxPerTx: P.maxPerTx,
        expiry: P.expiry,
        recipientRoot: P.recipientRoot,
        streamRate: P.streamRate,
        streamStart: P.streamRate === 0n ? undefined : opts.streamStart,
        pledge: terms,
      },
    ]);
    const allowance = res.allowances[0];
    const pledged = this.allowances.get(allowanceCommitment(allowance));
    if (!pledged || !res.lenderPayloads[0]) {
      throw new Error("pledged note not found after sync");
    }
    return {
      tx: res.tx,
      proof: res.proof,
      allowance,
      owned: pledged,
      payload: res.lenderPayloads[0],
      lender: lenderInfoOf(terms),
    };
  }

  // ---- disclosure ----

  async prove(
    owned: SolOwnedAllowance,
    kind: DisclosureKind,
    bound: bigint,
    audience: bigint,
  ): Promise<{ proof: ProofResult; args: DiscloseArgs }> {
    await this.sync();
    const built = discloseInput({
      root: this.tree.root,
      allowance: owned.allowance,
      path: this.tree.path(owned.index),
      kind,
      bound,
      audience,
    });
    const proof = await this.prover.prove("disclose", built.input);
    const [root, k, b, windowId, agentPk, aud] = built.publicSignals;
    return {
      proof,
      args: { root, kind: k, bound: b, windowId, agentPk, audience: aud },
    };
  }

  /** The lender-facing stream proof over a pledged allowance (see Wallet.proveStream). */
  async proveStream(
    owned: SolOwnedAllowance,
    bounds: { minRemaining: bigint; minRate: bigint; audience: bigint },
  ): Promise<{ proof: ProofResult; args: StreamArgs }> {
    if (!owned.lender || !owned.lenderKey) {
      throw new Error(
        "allowance is not pledged (or its lender pubkey is unknown)",
      );
    }
    await this.sync();
    const built = streamInput({
      root: this.tree.root,
      allowance: owned.allowance,
      path: this.tree.path(owned.index),
      lender: owned.lender,
      ...bounds,
    });
    const proof = await this.prover.prove("stream", built.input);
    const [
      root,
      minRemaining,
      minRate,
      ,
      loanRef,
      pledgeBps,
      expiry,
      lifetimeCap,
      pledgePaid,
      agentPk,
      audience,
      streamStart,
    ] = built.publicSignals;
    return {
      proof,
      args: {
        root,
        minRemaining,
        minRate,
        lender: owned.lenderKey,
        loanRef,
        pledgeBps: Number(pledgeBps),
        expiry,
        lifetimeCap,
        pledgePaid,
        agentPk,
        audience,
        streamStart,
        asset: this.mintOf(owned),
      },
    };
  }
}

/** Anyone with the pool can check a disclosure on chain. */
export function verifyDisclosure(
  pool: SolanaPool,
  payer: Keypair,
  proof: ProofResult,
  args: DiscloseArgs,
  mode: "send" | "simulate" = "send",
): Promise<boolean> {
  return pool.verifyDisclosure(payer, proof, args, mode);
}

/** Anyone with the pool can check a stream proof on chain. */
export function verifyStream(
  pool: SolanaPool,
  payer: Keypair,
  proof: ProofResult,
  args: StreamArgs,
  mode: "send" | "simulate" = "send",
): Promise<boolean> {
  return pool.verifyStream(payer, proof, args, mode);
}

// ------------------------------------------------------------------ lender

/** A pledged note the lender can follow and claim from. */
export interface LenderNoteRecord {
  allowance: Allowance;
  views: MemoViews;
  lender: LenderInfo;
  mint?: PublicKey;
  lenderKey?: PublicKey;
  commitment: bigint;
  index?: number;
  spent: boolean;
}

/**
 * The lender side: follows the pledged notes it is sent (the sealed copy at pledge time and every
 * LenderMemo), and claims the vested share as a lender-claim spend signed by `signer`, whose fieldOf
 * must equal the pledge's lenderAddr.
 */
export class SolanaLenderWallet extends Scanner {
  readonly notes = new Map<bigint, LenderNoteRecord>();
  private indexOf = new Map<bigint, number>();

  constructor(
    pool: SolanaPool,
    readonly signer: Keypair,
    readonly view: ViewingKey,
  ) {
    super(pool);
  }

  get lenderAddr(): bigint {
    return fieldOf(this.signer.publicKey);
  }

  /** Takes the sealed copy the owner handed over (pledge or grant result). */
  ingest(payload: LenderPayload): LenderNoteRecord | null {
    const rec = openSolLenderMemo(this.view, payload);
    if (!rec || rec.lender.lenderAddr !== this.lenderAddr) {
      return null;
    }
    const commitment = allowanceCommitment(rec.allowance);
    const r: LenderNoteRecord = {
      ...rec,
      commitment,
      index: this.indexOf.get(commitment),
      spent: false,
    };
    this.notes.set(commitment, r);
    return r;
  }

  protected onCommitment(commitment: bigint, index: number): void {
    this.indexOf.set(commitment, index);
    const n = this.notes.get(commitment);
    if (n) {
      n.index = index;
    }
  }

  protected onEvent(e: LocatedEvent): void {
    if (e.name === "LenderMemo") {
      this.ingest(e.encryptedLender);
    }
  }

  protected async afterSync(): Promise<void> {
    for (const n of this.notes.values()) {
      if (n.index === undefined) {
        n.index = this.indexOf.get(n.commitment);
      }
      if (
        this.nullifierSet.has(allowanceNullifier(n.allowance.rho, n.commitment))
      ) {
        n.spent = true;
      }
    }
  }

  live(): LenderNoteRecord[] {
    return [...this.notes.values()].filter(
      (n) => !n.spent && n.index !== undefined,
    );
  }

  /** Builds a lender claim of `amount` (at most the vested share not yet routed). */
  async prepareClaim(
    rec: LenderNoteRecord,
    amount: bigint,
    opts: { now?: bigint; signer?: Keypair } = {},
  ): Promise<PreparedSpend> {
    await this.sync();
    if (rec.index === undefined) {
      throw new Error("note not in the tree yet");
    }
    const mint = rec.mint;
    if (!mint) {
      throw new Error("mint unknown");
    }
    const signer = opts.signer ?? this.signer;
    const now = opts.now ?? (await this.pool.now());
    const base = {
      root: this.tree.root,
      allowance: rec.allowance,
      path: this.tree.path(rec.index),
      amount,
      now,
      claim: true,
      lender: rec.lender as LenderRef,
    };
    const draft = spendInput({ ...base, extDataHash: 0n });
    const extra = { mint, lenderKey: rec.lenderKey ?? this.signer.publicKey };
    const extBytes = encodeSpendExt({
      relayer: DEFAULT_PUBKEY,
      feeRecipient: DEFAULT_PUBKEY,
      encryptedAllowance: solAllowanceMemo(
        draft.next,
        rec.views,
        rec.lender,
        extra,
      ),
      encryptedPayment: new Uint8Array(),
      encryptedLender: solSealForLender(
        draft.next,
        rec.views,
        rec.lender,
        extra,
      ),
    });
    const h = extDataHash(extBytes);
    const built = spendInput({ ...base, extDataHash: h });
    const proof = await this.pool.prover.prove("spend", built.input);
    const tokenProgram = await this.pool.tokenProgramOf(mint);
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
      lenderAddr: rec.lender.lenderAddr,
      loanRef: rec.lender.loanRef,
      isLenderClaim: true,
      extDataHash: h,
    };
    await this.pool.ensureVault(signer, mint);
    const lenderToken = await this.pool.ensureAta(
      signer,
      mint,
      this.signer.publicKey,
    );
    const accounts: Omit<SpendAccounts, "buffer"> = {
      payer: signer.publicKey,
      nullifier: built.nullifier,
      token: { mint, tokenProgram },
      lenderToken,
      escrow: {
        lenderAddr: rec.lender.lenderAddr,
        loanRef: rec.lender.loanRef,
      },
      lenderSigner: this.signer.publicKey,
    };
    const signers = signer === this.signer ? [] : [this.signer];
    return {
      payload: concatBytes(
        encodeProof(proof.proof),
        encodeSpendArgs(args),
        extBytes,
      ),
      accounts,
      args,
      next: built.next,
      proof,
      signers,
    };
  }

  async submit(
    p: PreparedSpend,
    payer: Keypair = this.signer,
  ): Promise<SolTxResult & { next: Allowance }> {
    const tx = await this.pool.run(
      payer,
      p.payload,
      (buffer) => spendIx(this.pool.programId, { ...p.accounts, buffer }),
      p.signers,
    );
    await this.sync();
    return { tx, proof: p.proof, next: p.next };
  }

  async claim(
    rec: LenderNoteRecord,
    amount: bigint,
  ): Promise<SolTxResult & { next: Allowance }> {
    return this.submit(await this.prepareClaim(rec, amount));
  }
}
