// H081Bank: one agent's view of the bank, over the real SDK (src/solana/*) against the deployed programs.
// Everything the MCP server and the Agent Kit plugin do goes through here, so both behave the same:
//   - one Solana keypair signs (buffer staging takes several transactions per operation), holds the public
//     USDG/SOL/H081, and derives the shielded account (keys.ts);
//   - deposits are checked against the program's caps and the wallet's balances before a proof is made;
//   - withdrawals go through the relayer (fee to the treasury's USDG account, checked here before anything is
//     proven); when the relayer is configured but unavailable the withdrawal is refused, never silently sent
//     by the agent key (that would link the wallet to the recipient on chain); `direct: true` or an empty
//     H081_RELAYER_URL is the only way the signer sends. Above the relayer's anonymous free tier the agent
//     wallet is named as capacity operator (H081 staked in capacity_stake);
//   - loans are the site's two-party flow (pledge + lender proof code), there is no matching here;
//   - every program error is explained (errors.ts).
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { ed25519 } from "@noble/curves/ed25519";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  type TransactionInstruction,
} from "@solana/web3.js";
import { Account } from "../sdk/account.js";
import { initCrypto } from "../sdk/crypto.js";
import { type Prover } from "../sdk/prover.js";
import { RelayerClient, type RelayerInfo } from "../sdk/relayer-client.js";
import type { PoolEventLogSnapshot } from "../sdk/solana/events.js";
import {
  type SlotAccount,
  decodeSlot,
  maxPrincipal,
  originationFee,
  payoutAudience,
  slotPda,
} from "../sdk/solana/lender.js";
import { assetCapPda, configPda, vaultPda } from "../sdk/solana/pda.js";
import { decodeAssetCaps, decodeConfig } from "../sdk/solana/program.js";
import { sendLegacy } from "../sdk/solana/send.js";
import {
  createAtaIdempotentIx,
  readCapacity,
  requestUnstakeIx,
  stakeIx,
  unstakeIx,
} from "../sdk/solana/token.js";
import {
  type SolOwnedAllowance,
  type SolRelay,
  SolanaPool,
  SolanaWallet,
} from "../sdk/solana/wallet.js";
import { FlatDirProver } from "./circuits.js";
import { decodeTerms, encodeProofCode } from "./codes.js";
import {
  DEPOSIT_SOL_MIN,
  type H081Config,
  MAINNET,
  NOTICE,
  PUBLIC_RPC_HOSTS,
  checkCluster,
  isMainnetConfig,
  rpcHost,
} from "./constants.js";
import { type ProgramKind, explained } from "./errors.js";
import {
  ACCOUNT_SOURCE_NOTES,
  type AccountDerivation,
  type AccountSource,
  deriveAgentSk,
} from "./keys.js";
import { fromUnits } from "./units.js";

export interface Caps {
  perDeposit: bigint;
  total: bigint;
  inVault: bigint;
  paused: boolean;
}

export interface RelayTerms {
  url: string;
  relayer: PublicKey;
  feeRecipient: PublicKey;
  minFee: bigint;
  feeBps: number;
  treasury?: string;
  freeTier?: bigint;
}

export interface AllowanceView {
  id: bigint;
  agentIndex?: number;
  remaining: bigint;
  remainingUsdg: string;
  lifetimeCap: bigint;
  windowCap: bigint;
  windowLen: bigint;
  maxPerTx: bigint;
  expiry: bigint;
  streamRate: bigint;
  streamStart: bigint;
  pledgeBps: bigint;
  loanRef?: bigint;
  lender?: string;
}

export interface BalanceView {
  shielded: bigint;
  shieldedUsdg: string;
  walletUsdg: bigint;
  walletUsdgHuman: string;
  walletSol: number;
  signer: string;
  shieldedAddress: { pk: string; viewPub: string };
  /** allowances this account granted to its sub-accounts (loan pledges live here) */
  subAccounts: AllowanceView[];
  /** allowances this account itself can spend as an agent (granted by someone else) */
  agentAllowances: AllowanceView[];
  caps: Caps | null;
}

export interface DepositResult {
  signature: string;
  amount: bigint;
  amountUsdg: string;
  shielded: bigint;
  shieldedUsdg: string;
  computeUnits: number;
}
export interface WithdrawResult {
  signature: string;
  amount: bigint;
  fee: bigint;
  received: bigint;
  receivedUsdg: string;
  to: string;
  via: "relayer" | "direct";
  shielded: bigint;
  shieldedUsdg: string;
  /** the agent wallet, when it was named to the relayer as capacity operator (public amount above the free tier) */
  operator?: string;
}

/** The relayer is configured but cannot be used: unreachable, wrong pool or asset, or a fee account that is not the treasury's. */
export class RelayerUnavailableError extends Error {
  constructor(
    readonly reason:
      | "unreachable"
      | "no_solana"
      | "asset_not_accepted"
      | "wrong_pool"
      | "wrong_fee_account",
    message: string,
  ) {
    super(message);
    this.name = "RelayerUnavailableError";
  }
}
export interface StakeView {
  signer: string;
  walletH081: bigint;
  staked: bigint;
  pending: bigint;
  readyAt: bigint;
  now: bigint;
  desks: bigint;
  shieldCap: bigint;
  totalStaked: bigint;
  caps: { maxPerStake: bigint; maxTotal: bigint; paused: boolean };
  cooldownDays: number;
}
export interface LoanQuote {
  pledgeBps: number;
  minRemaining: bigint;
  maxPrincipal: bigint;
  principal: bigint;
  originationFee: bigint;
  originationFeeBps: number;
  payout: bigint;
  loanRef?: bigint;
  slot?: SlotView | null;
  note: string;
}
export interface SlotView {
  loanRef: bigint;
  lender: string;
  funded: boolean;
  settled: boolean;
  principal: bigint;
  repaid: bigint;
  expiry: bigint;
  pledgeBps: bigint;
  payoutTo: string;
}
export interface BorrowRules {
  budget: bigint;
  dailyCap?: bigint;
  maxPerTx?: bigint;
  days: number;
  unlockDays: number;
  agentIndex?: number;
}
export interface BorrowResult {
  agentIndex: number;
  allowanceId: bigint;
  loanRef: bigint;
  pledgeBps: bigint;
  grantSignature: string;
  proofCode: string;
  maxPrincipal: bigint;
  originationFeeAtMax: bigint;
  payoutAccount: string;
  streamRate: bigint;
  expiry: bigint;
  next: string;
}

export interface BankOptions {
  config: H081Config;
  signer: Keypair;
  /** the shielded account secret (keys.ts accountSkFromEnv) */
  accountSk: bigint;
  /** how sub-accounts are derived from the signer (keys.ts; default `seed`) */
  derivation?: AccountDerivation;
  /** where `accountSk` came from, for protocolInfo (default: `derivation`) */
  accountSource?: AccountSource;
  connection?: Connection;
  /** default: FlatDirProver over config.circuitsDir */
  prover?: Prover;
  fetch?: typeof fetch;
  /** event-log cache directory; default <circuitsDir>/../cache; null disables */
  cacheDir?: string | null;
  log?: (line: string) => void;
  /** skip the genesis/id check (tests against a mocked connection) */
  skipClusterCheck?: boolean;
}

const MAX_AGENTS = 16;

export class H081Bank {
  readonly connection: Connection;
  readonly pool: SolanaPool;
  readonly owner: SolanaWallet;
  readonly account: Account;
  readonly signer: Keypair;
  readonly config: H081Config;
  readonly usdg: PublicKey;
  readonly stakeMint: PublicKey;
  readonly decimals: number;
  readonly prover: Prover;
  private readonly relayer?: RelayerClient;
  private readonly agents = new Map<
    number,
    { account: Account; wallet: SolanaWallet }
  >();
  private readonly log: (line: string) => void;
  private readonly cacheFile?: string;
  private readonly derivation: AccountDerivation;
  private readonly accountSource: AccountSource;

  private constructor(
    opts: BankOptions,
    connection: Connection,
    prover: Prover,
  ) {
    this.config = opts.config;
    this.connection = connection;
    this.prover = prover;
    this.signer = opts.signer;
    this.derivation = opts.derivation ?? "seed";
    this.accountSource = opts.accountSource ?? this.derivation;
    this.usdg = opts.config.usdgMint;
    this.stakeMint = opts.config.stakeMint;
    this.decimals = opts.config.decimals;
    this.log =
      opts.log ??
      (() => {
        // silent by default
      });
    this.pool = new SolanaPool(connection, opts.config.poolProgramId, prover);
    this.account = new Account(opts.accountSk);
    this.owner = new SolanaWallet(this.account, this.pool, opts.signer);
    this.owner.registerMint(this.usdg);
    if (opts.config.relayerUrl) {
      this.relayer = new RelayerClient(opts.config.relayerUrl, opts.fetch);
    }
    const cacheDir =
      opts.cacheDir === undefined
        ? join(opts.config.circuitsDir, "..", "cache")
        : opts.cacheDir;
    if (cacheDir) {
      this.cacheFile = join(
        cacheDir,
        `${opts.config.cluster}-${opts.config.poolProgramId.toBase58()}.events.json`,
      );
    }
  }

  /** Opens the bank: crypto init, cluster check, event-log cache. No transaction is sent. */
  static async open(opts: BankOptions): Promise<H081Bank> {
    await initCrypto();
    const connection =
      opts.connection ?? new Connection(opts.config.rpcUrl, "confirmed");
    if (!opts.skipClusterCheck) {
      checkCluster(opts.config, await connection.getGenesisHash());
    }
    const prover = opts.prover ?? new FlatDirProver(opts.config.circuitsDir);
    let bank = new H081Bank(opts, connection, prover);
    if (!(await bank.loadCache())) {
      bank = new H081Bank(opts, connection, prover); // the cache did not match the chain
    }
    return bank;
  }

  get programIds(): Partial<Record<ProgramKind, string>> {
    return {
      pool: this.config.poolProgramId.toBase58(),
      loan: this.config.loanProgramId.toBase58(),
      capacity: this.config.capacityProgramId.toBase58(),
      safety: this.config.safetyProgramId.toBase58(),
    };
  }

  // ---- event-log cache (public chain data only: commitments, nullifiers, encrypted memos; never a key)

  private async loadCache(): Promise<boolean> {
    if (!this.cacheFile || !existsSync(this.cacheFile)) {
      return true;
    }
    let snap: PoolEventLogSnapshot;
    try {
      snap = JSON.parse(readFileSync(this.cacheFile, "utf8"));
    } catch {
      return true;
    }
    if (!this.pool.log.restore(snap)) {
      return true;
    }
    try {
      await this.owner.sync();
    } finally {
      this.saveCache();
    }
    if (await this.owner.matchesChain()) {
      return true;
    }
    this.log("event cache does not match the chain; rescanning");
    try {
      unlinkSync(this.cacheFile);
    } catch {
      /* ignore */
    }
    return false;
  }

  private saveCache(): void {
    if (!this.cacheFile) {
      return;
    }
    try {
      mkdirSync(join(this.cacheFile, ".."), { recursive: true });
      writeFileSync(this.cacheFile, JSON.stringify(this.pool.log.snapshot()));
    } catch (e) {
      this.log(`could not save the event cache: ${(e as Error).message}`);
    }
  }

  /** Fetches new pool events and re-reads this account's notes; saves the cache. */
  async sync(): Promise<void> {
    try {
      await this.owner.sync();
    } finally {
      this.saveCache();
    }
  }

  // ---- reads

  async tokenProgram(): Promise<PublicKey> {
    return this.pool.tokenProgramOf(this.usdg);
  }

  /** The signer's USDG associated token account. */
  async walletUsdgAccount(): Promise<PublicKey> {
    return getAssociatedTokenAddressSync(
      this.usdg,
      this.signer.publicKey,
      false,
      await this.tokenProgram(),
    );
  }

  /** Deposit caps and pause flag as the program enforces them (null when the guard accounts are missing). */
  async caps(): Promise<Caps | null> {
    const pid = this.config.poolProgramId;
    const [cfg, cap] = await Promise.all([
      this.connection.getAccountInfo(configPda(pid), "confirmed"),
      this.connection.getAccountInfo(assetCapPda(pid, this.usdg), "confirmed"),
    ]);
    if (!cfg || !cap) {
      return null;
    }
    const c = decodeConfig(cfg.data),
      a = decodeAssetCaps(cap.data);
    const inVault = await this.pool.tokenBalance(vaultPda(pid, this.usdg));
    return {
      perDeposit: a.maxPerDeposit,
      total: a.maxTotal,
      inVault,
      paused: c.depositsPaused,
    };
  }

  private agentPks(): Map<bigint, number> {
    const m = new Map<bigint, number>();
    for (let i = 0; i < MAX_AGENTS; i++) {
      m.set(this.agent(i).account.keys.pk, i);
    }
    return m;
  }

  private view(a: SolOwnedAllowance, agentIndex?: number): AllowanceView {
    const P = a.allowance.policy;
    return {
      id: a.commitment,
      agentIndex,
      remaining: a.allowance.remaining,
      remainingUsdg: fromUnits(a.allowance.remaining, this.decimals),
      lifetimeCap: P.lifetimeCap,
      windowCap: P.windowCap,
      windowLen: P.windowLen,
      maxPerTx: P.maxPerTx,
      expiry: P.expiry,
      streamRate: P.streamRate,
      streamStart: P.streamStart,
      pledgeBps: P.pledgeBps,
      loanRef: a.lender?.loanRef,
      lender: a.lenderKey?.toBase58(),
    };
  }

  async balance(): Promise<BalanceView> {
    await this.sync();
    const [walletUsdg, lamports, caps] = await Promise.all([
      this.walletUsdgAccount().then((ata) => this.pool.tokenBalance(ata)),
      this.connection.getBalance(this.signer.publicKey, "confirmed"),
      this.caps().catch(() => null),
    ]);
    const byPk = this.agentPks();
    const shielded = this.owner.balance(this.usdg);
    const usdgOnly = (a: SolOwnedAllowance) =>
      a.allowance.asset === this.owner.registerMint(this.usdg);
    return {
      shielded,
      shieldedUsdg: fromUnits(shielded, this.decimals),
      walletUsdg,
      walletUsdgHuman: fromUnits(walletUsdg, this.decimals),
      walletSol: lamports / LAMPORTS_PER_SOL,
      signer: this.signer.publicKey.toBase58(),
      shieldedAddress: this.shieldedAddress(),
      subAccounts: this.owner
        .grantedAllowances()
        .filter(usdgOnly)
        .map((a) => this.view(a, byPk.get(a.allowance.agentPk))),
      agentAllowances: this.owner
        .agentAllowances(this.usdg)
        .map((a) => this.view(a)),
      caps,
    };
  }

  shieldedAddress(): { pk: string; viewPub: string } {
    return {
      pk: this.account.address.pk.toString(),
      viewPub: "0x" + Buffer.from(this.account.address.viewPub).toString("hex"),
    };
  }

  // ---- deposit

  /** Shields `amount` USDG from the signer's token account. Refuses, before any proof, what the program would refuse. */
  async deposit(amount: bigint): Promise<DepositResult> {
    if (amount <= 0n) {
      throw new Error("the amount must be positive");
    }
    const d = this.decimals,
      sym = MAINNET.usdg.symbol;
    const caps = await this.caps();
    if (caps?.paused) {
      throw new Error(
        "DepositsPaused: new deposits are paused for now; withdrawals still work.",
      );
    }
    if (caps && amount > caps.perDeposit) {
      throw new Error(
        `DepositTooLarge: at most ${fromUnits(caps.perDeposit, d)} ${sym} per deposit (asked ${fromUnits(amount, d)}).`,
      );
    }
    if (caps && caps.inVault + amount > caps.total) {
      const room = caps.total > caps.inVault ? caps.total - caps.inVault : 0n;
      throw new Error(
        `DepositCapExceeded: the bank holds at most ${fromUnits(caps.total, d)} ${sym} in total; ${fromUnits(room, d)} ${sym} of room left.`,
      );
    }
    if (
      this.config.maxDeposit !== undefined &&
      amount > this.config.maxDeposit
    ) {
      throw new Error(
        `over the operator ceiling H081_MAX_DEPOSIT (${fromUnits(this.config.maxDeposit, d)} ${sym} per deposit).`,
      );
    }
    const [have, lamports] = await Promise.all([
      this.walletUsdgAccount().then((ata) => this.pool.tokenBalance(ata)),
      this.connection.getBalance(this.signer.publicKey, "confirmed"),
    ]);
    if (have < amount) {
      throw new Error(
        `the agent wallet ${this.signer.publicKey.toBase58()} holds ${fromUnits(have, d)} ${sym}, less than ${fromUnits(amount, d)}.`,
      );
    }
    if (lamports < DEPOSIT_SOL_MIN * LAMPORTS_PER_SOL) {
      throw new Error(
        `the agent wallet holds ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL; a deposit needs about ${DEPOSIT_SOL_MIN} SOL for buffer rent (refunded) and fees.`,
      );
    }
    try {
      const r = await this.owner.deposit(this.usdg, amount);
      this.saveCache();
      const shielded = this.owner.balance(this.usdg);
      return {
        signature: r.tx.signature,
        amount,
        amountUsdg: fromUnits(amount, d),
        shielded,
        shieldedUsdg: fromUnits(shielded, d),
        computeUnits: r.tx.computeUnits,
      };
    } catch (e) {
      this.saveCache();
      throw explained(e, { program: "pool", ids: this.programIds });
    }
  }

  // ---- withdraw

  /**
   * The relayer's terms for USDG. Undefined only when no relayer is configured (H081_RELAYER_URL empty).
   * Throws RelayerUnavailableError when the relayer is unreachable, does not serve this pool or USDG, or
   * names a fee account that is not the treasury's: on mainnet exactly the treasury's USDG account
   * (MAINNET.treasuryUsdgAccount, owned by MAINNET.loanTreasury); elsewhere the ATA of the treasury it names.
   * Nothing else is ever bound into a proof as fee recipient.
   */
  async relayTerms(): Promise<RelayTerms | undefined> {
    if (!this.relayer) {
      return undefined;
    }
    const url = this.relayer.url,
      sym = MAINNET.usdg.symbol;
    let info: RelayerInfo & {
      solana?: {
        feeBps?: number;
        treasury?: string;
        capacity?: { freeTier?: string };
      };
    };
    try {
      info = await this.relayer.info();
    } catch (e) {
      throw new RelayerUnavailableError(
        "unreachable",
        `the relayer ${url} is unreachable (${(e as Error).message})`,
      );
    }
    const sol = info.solana;
    if (!sol) {
      throw new RelayerUnavailableError(
        "no_solana",
        `the relayer ${url} does not relay Solana operations`,
      );
    }
    const mint = this.usdg.toBase58();
    const minFee = sol.minFees?.[mint],
      feeRecipient = sol.feeAccounts?.[mint];
    if (minFee === undefined || !feeRecipient) {
      throw new RelayerUnavailableError(
        "asset_not_accepted",
        `the relayer ${url} does not accept ${sym} (${mint})`,
      );
    }
    if (
      sol.programId &&
      sol.programId !== this.config.poolProgramId.toBase58()
    ) {
      throw new RelayerUnavailableError(
        "wrong_pool",
        `the relayer ${url} serves pool ${sol.programId}, not ${this.config.poolProgramId.toBase58()}`,
      );
    }
    let feeAccount: PublicKey, relayerKey: PublicKey;
    try {
      feeAccount = new PublicKey(feeRecipient);
      relayerKey = new PublicKey(sol.relayer);
    } catch {
      throw new RelayerUnavailableError(
        "wrong_fee_account",
        `the relayer ${url} names an invalid fee account or relayer key`,
      );
    }
    const wrong = (why: string) =>
      new RelayerUnavailableError(
        "wrong_fee_account",
        `the relayer ${url} names ${feeRecipient} as its ${sym} fee account (treasury ${sol.treasury ?? "unset"}), ${why}; H081 relay fees go only to the protocol treasury, so this relayer is refused and nothing was signed`,
      );
    if (isMainnetConfig(this.config)) {
      if (
        feeRecipient !== MAINNET.treasuryUsdgAccount ||
        sol.treasury !== MAINNET.loanTreasury
      ) {
        throw wrong(
          `not the treasury's ${sym} account ${MAINNET.treasuryUsdgAccount} owned by ${MAINNET.loanTreasury}`,
        );
      }
    } else {
      let treasury: PublicKey;
      try {
        treasury = sol.treasury
          ? new PublicKey(sol.treasury)
          : this.config.loanTreasury;
      } catch {
        throw wrong("which is not a valid treasury");
      }
      const want = getAssociatedTokenAddressSync(
        this.usdg,
        treasury,
        true,
        await this.tokenProgram(),
      );
      if (!feeAccount.equals(want)) {
        throw wrong(
          `not the treasury's associated ${sym} account ${want.toBase58()}`,
        );
      }
    }
    return {
      url,
      relayer: relayerKey,
      feeRecipient: feeAccount,
      minFee: BigInt(minFee),
      feeBps: sol.feeBps ?? 0,
      treasury: sol.treasury,
      freeTier:
        sol.capacity?.freeTier === undefined
          ? undefined
          : BigInt(sol.capacity.freeTier),
    };
  }

  /** The agent wallet's shieldCap from capacity_stake (undefined when it cannot be read). */
  private async shieldCap(): Promise<
    { staked: bigint; shieldCap: bigint } | undefined
  > {
    try {
      const c = await readCapacity(
        this.connection,
        this.config.capacityProgramId,
        this.stakeMint,
        this.signer.publicKey,
      );
      return { staked: c.stake.staked, shieldCap: c.shieldCap };
    } catch (e) {
      this.log(`capacity_stake not readable: ${(e as Error).message}`);
      return undefined;
    }
  }

  /**
   * The smallest fee the relayer accepts for a withdrawal of `amount`: it checks fee >= max(minFee, bps *
   * public amount / 10000) where the public amount is what the recipient receives, amount - fee.
   */
  static relayFee(
    amount: bigint,
    t: Pick<RelayTerms, "minFee" | "feeBps">,
  ): bigint {
    const bps = BigInt(t.feeBps);
    let fee = (bps * amount) / (10_000n + bps);
    if (fee < t.minFee) {
      fee = t.minFee;
    }
    const need = (f: bigint) => {
      const pct = (bps * (amount - f)) / 10_000n;
      return pct > t.minFee ? pct : t.minFee;
    };
    while (fee < need(fee)) {
      fee++;
    }
    return fee;
  }

  async withdraw(
    amount: bigint,
    to?: PublicKey,
    direct = false,
  ): Promise<WithdrawResult> {
    if (amount <= 0n) {
      throw new Error("the amount must be positive");
    }
    const d = this.decimals,
      sym = MAINNET.usdg.symbol;
    const dest = to ?? this.signer.publicKey;
    await this.pool.checkRecipient(dest);
    await this.sync();
    const shielded = this.owner.balance(this.usdg);
    if (amount > shielded) {
      throw new Error(
        `the shielded balance is ${fromUnits(shielded, d)} ${sym}, less than ${fromUnits(amount, d)}.`,
      );
    }
    const me = this.signer.publicKey.toBase58();
    const directHint = `pass direct: true to have the agent wallet ${me} send it itself (no relay fee; the chain then links the agent wallet to ${dest.toBase58()})`;
    let terms: RelayTerms | undefined;
    if (!direct) {
      if (!this.relayer) {
        this.log(
          "no relayer configured (H081_RELAYER_URL is empty): the agent key sends the withdrawal itself",
        );
      } else {
        // fail closed: a configured relayer that cannot be used never turns into a direct send
        try {
          terms = await this.relayTerms();
        } catch (e) {
          throw new Error(
            `${(e as Error).message}. The withdrawal was not sent: retry later, or ${directHint}.`,
          );
        }
      }
    }
    let relay: SolRelay = {};
    let fee = 0n;
    let operator: string | undefined;
    if (terms) {
      fee = H081Bank.relayFee(amount, terms);
      if (fee >= amount) {
        throw new Error(
          `the relay fee ${fromUnits(fee, d)} ${sym} is not below the amount; withdraw more or use direct: true.`,
        );
      }
      relay = {
        via: this.relayer,
        relayer: terms.relayer,
        feeRecipient: terms.feeRecipient,
        fee,
      };
      const pub = amount - fee;
      if (terms.freeTier !== undefined && pub > terms.freeTier) {
        // above the anonymous free tier the relayer wants a capacity operator: the agent wallet, with its H081 stake
        const cap = await this.shieldCap();
        const tier = fromUnits(terms.freeTier, d);
        if (cap && pub > terms.freeTier + cap.shieldCap) {
          throw new Error(
            `${fromUnits(pub, d)} ${sym} is above the relayer's anonymous free tier (${tier} ${sym} per 30 days) plus the agent wallet's staked capacity ` +
              `(${fromUnits(cap.shieldCap, d)} ${sym} from ${fromUnits(cap.staked, MAINNET.h081.decimals)} ${MAINNET.h081.symbol} in capacity_stake). Nothing was sent. ` +
              `Stake more ${MAINNET.h081.symbol} (h081_stake), withdraw at most ${fromUnits(terms.freeTier + cap.shieldCap, d)} ${sym} per 30 days through the relayer, or ${directHint}.`,
          );
        }
        const seed = this.signer.secretKey.subarray(0, 32);
        relay.operator = {
          operator: this.signer.publicKey,
          sign: (m) => ed25519.sign(m, seed),
        };
        operator = me;
        this.log(
          `${fromUnits(pub, d)} ${sym} is above the free tier of ${tier}: the agent wallet is named to the relayer as capacity operator`,
        );
      }
    }
    try {
      const r = await this.owner.withdraw(this.usdg, amount, dest, relay);
      this.saveCache();
      const left = this.owner.balance(this.usdg);
      return {
        signature: r.tx.signature,
        amount,
        fee,
        received: amount - fee,
        receivedUsdg: fromUnits(amount - fee, d),
        to: dest.toBase58(),
        via: terms ? "relayer" : "direct",
        shielded: left,
        shieldedUsdg: fromUnits(left, d),
        ...(operator ? { operator } : {}),
      };
    } catch (e) {
      this.saveCache();
      throw explained(e, { program: "pool", ids: this.programIds });
    }
  }

  // ---- capacity_stake (H081)

  private async stakeTokenProgram(): Promise<PublicKey> {
    const info = await this.connection.getAccountInfo(
      this.stakeMint,
      "confirmed",
    );
    if (!info) {
      throw new Error(
        `${MAINNET.h081.symbol} mint ${this.stakeMint.toBase58()} not found`,
      );
    }
    return info.owner;
  }

  async stakeView(): Promise<StakeView> {
    const pid = this.config.capacityProgramId;
    const tp = await this.stakeTokenProgram();
    const ata = getAssociatedTokenAddressSync(
      this.stakeMint,
      this.signer.publicKey,
      false,
      tp,
    );
    const [c, walletH081, now] = await Promise.all([
      readCapacity(this.connection, pid, this.stakeMint, this.signer.publicKey),
      this.pool.tokenBalance(ata),
      this.pool.now(),
    ]);
    return {
      signer: this.signer.publicKey.toBase58(),
      walletH081,
      staked: c.stake.staked,
      pending: c.stake.pending,
      readyAt: c.stake.readyAt,
      now,
      desks: c.desks,
      shieldCap: c.shieldCap,
      totalStaked: c.config.totalStaked,
      caps: {
        maxPerStake: c.config.maxPerStake,
        maxTotal: c.config.maxTotal,
        paused: c.config.stakingPaused,
      },
      cooldownDays: 30,
    };
  }

  private async sendStake(ixs: TransactionInstruction[]): Promise<string> {
    try {
      return await sendLegacy(this.connection, this.signer, [this.signer], ixs);
    } catch (e) {
      throw explained(e, { program: "capacity", ids: this.programIds });
    }
  }

  async stake(amount: bigint): Promise<StakeView & { signature: string }> {
    const v = await this.stakeView(),
      d = MAINNET.h081.decimals,
      sym = MAINNET.h081.symbol;
    if (amount <= 0n) {
      throw new Error("the amount must be positive");
    }
    if (v.caps.paused) {
      throw new Error(
        "StakingPaused: new staking is paused for now; unstaking still works.",
      );
    }
    if (amount > v.caps.maxPerStake) {
      throw new Error(
        `StakeCap: at most ${fromUnits(v.caps.maxPerStake, d)} ${sym} per stake.`,
      );
    }
    if (v.totalStaked + amount > v.caps.maxTotal) {
      throw new Error(
        `StakeCap: at most ${fromUnits(v.caps.maxTotal, d)} ${sym} staked in total.`,
      );
    }
    if (amount > v.walletH081) {
      throw new Error(
        `the agent wallet holds ${fromUnits(v.walletH081, d)} ${sym}, less than ${fromUnits(amount, d)}.`,
      );
    }
    const tp = await this.stakeTokenProgram();
    const from = getAssociatedTokenAddressSync(
      this.stakeMint,
      this.signer.publicKey,
      false,
      tp,
    );
    const signature = await this.sendStake([
      stakeIx(
        this.config.capacityProgramId,
        this.signer.publicKey,
        this.stakeMint,
        from,
        amount,
        tp,
      ),
    ]);
    return { signature, ...(await this.stakeView()) };
  }

  async requestUnstake(
    amount: bigint,
  ): Promise<StakeView & { signature: string }> {
    const v = await this.stakeView(),
      d = MAINNET.h081.decimals,
      sym = MAINNET.h081.symbol;
    if (amount <= 0n) {
      throw new Error("the amount must be positive");
    }
    if (amount > v.staked) {
      throw new Error(
        `MoreThanStaked: only ${fromUnits(v.staked, d)} ${sym} is staked.`,
      );
    }
    const signature = await this.sendStake([
      requestUnstakeIx(
        this.config.capacityProgramId,
        this.signer.publicKey,
        this.stakeMint,
        amount,
      ),
    ]);
    return { signature, ...(await this.stakeView()) };
  }

  async unstake(): Promise<StakeView & { signature: string }> {
    const v = await this.stakeView();
    if (v.pending === 0n) {
      throw new Error(
        "NothingPending: nothing is waiting to unstake; request_unstake first.",
      );
    }
    if (v.now < v.readyAt) {
      throw new Error(
        `Cooldown: unstakable from ${new Date(Number(v.readyAt) * 1000).toISOString()}.`,
      );
    }
    const tp = await this.stakeTokenProgram();
    const to = getAssociatedTokenAddressSync(
      this.stakeMint,
      this.signer.publicKey,
      false,
      tp,
    );
    const signature = await this.sendStake([
      createAtaIdempotentIx(
        this.signer.publicKey,
        this.signer.publicKey,
        this.stakeMint,
        tp,
      ),
      unstakeIx(
        this.config.capacityProgramId,
        this.signer.publicKey,
        this.stakeMint,
        to,
        tp,
      ),
    ]);
    return { signature, ...(await this.stakeView()) };
  }

  // ---- loans (stream_loan): the borrower side

  async loanSlot(loanRef: bigint): Promise<SlotView | null> {
    const info = await this.connection.getAccountInfo(
      slotPda(loanRef, this.config.loanProgramId),
      "confirmed",
    );
    if (!info) {
      return null;
    }
    let s: SlotAccount;
    try {
      s = decodeSlot(info.data);
    } catch {
      return null;
    }
    return {
      loanRef: s.loanRef,
      lender: s.lender.toBase58(),
      funded: s.funded,
      settled: s.settled,
      principal: s.principal,
      repaid: s.repaid,
      expiry: s.expiry,
      pledgeBps: s.pledgeBps,
      payoutTo: s.payoutTo.toBase58(),
    };
  }

  /** Pure pricing (stream_loan::max_principal and the 0.25% origination fee) plus, with a loanRef, the slot on chain. */
  async loanQuote(q: {
    termsCode?: string;
    minRemaining?: bigint;
    pledgeBps?: number;
    principal?: bigint;
    loanRef?: bigint;
  }): Promise<LoanQuote> {
    let pledgeBps = q.pledgeBps,
      loanRef = q.loanRef;
    if (q.termsCode) {
      const t = decodeTerms(q.termsCode);
      this.checkTerms(t);
      pledgeBps ??= Number(t.pledgeBps);
      loanRef ??= t.loanRef;
    }
    if (pledgeBps === undefined && loanRef === undefined) {
      throw new Error("give a termsCode, a pledgeBps or a loanRef");
    }
    const slot =
      loanRef === undefined ? undefined : await this.loanSlot(loanRef);
    if (pledgeBps === undefined && slot?.funded) {
      pledgeBps = Number(slot.pledgeBps);
    }
    const bps = pledgeBps ?? 0;
    const minRemaining = q.minRemaining ?? 0n;
    const max = maxPrincipal(minRemaining, bps);
    const principal = q.principal ?? max;
    if (principal > max) {
      throw new Error(
        `PrincipalTooLarge: at most ${fromUnits(max, this.decimals)} USDG against ${fromUnits(minRemaining, this.decimals)} USDG pledged at ${bps} bps.`,
      );
    }
    const fee = originationFee(principal);
    return {
      pledgeBps: bps,
      minRemaining,
      maxPrincipal: max,
      principal,
      originationFee: fee,
      originationFeeBps: 25,
      payout: principal - fee,
      loanRef,
      slot,
      note: "terms come from a lender off-chain (no on-chain offer book); h081_loan_borrow pledges to them and returns the proof code the lender funds against",
    };
  }

  private checkTerms(t: ReturnType<typeof decodeTerms>): void {
    if (
      t.program !== this.config.loanProgramId.toBase58() ||
      t.cluster !== this.config.cluster ||
      t.mint !== this.usdg.toBase58()
    ) {
      throw new Error(
        "those loan terms are for another network, loan program or asset.",
      );
    }
    if (!t.lender.equals(slotPda(t.loanRef, this.config.loanProgramId))) {
      throw new Error(
        "those loan terms name an account that is not the loan slot.",
      );
    }
    if (t.pledgeBps <= 0n || t.pledgeBps > 10000n) {
      throw new Error("pledgeBps in the terms must be 1..10000");
    }
  }

  /** Sub-account `i` of this agent (its own shielded account, granted to by the owner account). */
  agent(i: number): { account: Account; wallet: SolanaWallet } {
    let a = this.agents.get(i);
    if (!a) {
      const account = new Account(
        deriveAgentSk(this.signer, i, this.derivation),
      );
      const wallet = new SolanaWallet(account, this.pool, this.signer);
      wallet.registerMint(this.usdg);
      a = { account, wallet };
      this.agents.set(i, a);
    }
    return a;
  }

  private async freeAgentIndex(): Promise<number> {
    const used = new Set(
      this.owner.grantedAllowances().map((g) => g.allowance.agentPk),
    );
    for (let i = 0; i < MAX_AGENTS; i++) {
      if (!used.has(this.agent(i).account.keys.pk)) {
        return i;
      }
    }
    throw new Error(`all ${MAX_AGENTS} sub-accounts are in use`);
  }

  /**
   * Borrower flow, as the site does it: grant a pledged, streaming allowance from the shielded balance to a
   * sub-account, then make the stream proof for the lender with the agent wallet's USDG account as payout.
   */
  async borrow(termsCode: string, rules: BorrowRules): Promise<BorrowResult> {
    const d = this.decimals,
      sym = MAINNET.usdg.symbol;
    const t = decodeTerms(termsCode);
    this.checkTerms(t);
    if (rules.budget <= 0n) {
      throw new Error("the budget must be positive");
    }
    if (!(rules.unlockDays > 0) || rules.unlockDays > rules.days) {
      throw new Error(
        "the budget must unlock within the allowance lifetime (0 < unlockDays <= days)",
      );
    }
    const slot = await this.loanSlot(t.loanRef);
    if (!slot) {
      throw new Error(`loan slot #${t.loanRef} does not exist on chain.`);
    }
    if (slot.funded) {
      throw new Error(
        `AlreadyFunded: loan slot #${t.loanRef} is already funded.`,
      );
    }
    await this.sync();
    const shielded = this.owner.balance(this.usdg);
    if (rules.budget > shielded) {
      throw new Error(
        `the shielded balance is ${fromUnits(shielded, d)} ${sym}, less than the budget ${fromUnits(rules.budget, d)}; deposit first.`,
      );
    }
    const lamports = await this.connection.getBalance(
      this.signer.publicKey,
      "confirmed",
    );
    if (lamports < 0.1 * LAMPORTS_PER_SOL) {
      throw new Error(
        `the agent wallet holds ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL; a pledge stages a large proof and needs about 0.1 SOL (most of it refunded).`,
      );
    }
    const i = rules.agentIndex ?? (await this.freeAgentIndex());
    const a = this.agent(i);
    const now = await this.pool.now();
    const secs = BigInt(Math.max(1, Math.round(rules.unlockDays * 86400)));
    const streamRate = (rules.budget + secs - 1n) / secs;
    const expiry = now + BigInt(Math.round(rules.days * 86400));
    let grantSignature: string;
    try {
      const r = await this.owner.grant(this.usdg, [
        {
          to: a.account.address,
          amount: rules.budget,
          windowCap: rules.dailyCap ?? 0n,
          windowLen: 86400n,
          maxPerTx: rules.maxPerTx ?? 0n,
          expiry,
          streamRate,
          streamStart: now,
          pledge: {
            lender: t.lender,
            loanRef: t.loanRef,
            pledgeBps: t.pledgeBps,
            lenderViewPub: t.lenderViewPub,
          },
        },
      ]);
      grantSignature = r.tx.signature;
    } catch (e) {
      throw explained(e, { program: "pool", ids: this.programIds });
    } finally {
      this.saveCache();
    }
    await a.wallet.sync();
    const owned = a.wallet
      .agentAllowances(this.usdg)
      .filter((x) => x.lender?.loanRef === t.loanRef)
      .sort((x, y) => y.index - x.index)[0];
    if (!owned || !owned.lender || !owned.lenderKey) {
      throw new Error(
        `the pledged allowance was granted (${grantSignature}) but not found after sync; retry h081_loan_borrow later with the same agentIndex ${i}`,
      );
    }
    const payout = await this.pool.ensureAta(
      this.signer,
      this.usdg,
      this.signer.publicKey,
    );
    const P = owned.allowance.policy;
    const minRemaining = owned.allowance.remaining;
    const s = await a.wallet.proveStream(owned, {
      minRemaining,
      minRate: P.streamRate,
      audience: payoutAudience(payout),
    });
    const ok = await this.prover.verify("stream", s.proof).catch(() => true); // a missing vkey must not block; the lender verifies on chain
    if (!ok) {
      throw new Error(
        "the stream proof did not verify locally; the proving artifacts may be corrupt (run fetch-circuits)",
      );
    }
    const proofCode = encodeProofCode({
      v: 1,
      cluster: this.config.cluster,
      program: this.config.loanProgramId.toBase58(),
      ref: t.loanRef,
      payout,
      proof: s.proof.proof,
      args: s.args,
    });
    const max = maxPrincipal(minRemaining, P.pledgeBps);
    return {
      agentIndex: i,
      allowanceId: owned.commitment,
      loanRef: t.loanRef,
      pledgeBps: t.pledgeBps,
      grantSignature,
      proofCode,
      maxPrincipal: max,
      originationFeeAtMax: originationFee(max),
      payoutAccount: payout.toBase58(),
      streamRate,
      expiry,
      next: `hand proofCode to the lender; they can fund up to ${fromUnits(max, d)} ${sym} against it, and the principal minus the 0.25% origination fee arrives in ${payout.toBase58()} when they do`,
    };
  }

  // ---- info

  /** Facts about the deployment and this agent. Never the RPC URL (its path/query may carry an API key): only its host. */
  async protocolInfo(): Promise<Record<string, unknown>> {
    let terms: RelayTerms | undefined, relayerStatus: string;
    const [caps, genesis] = await Promise.all([
      this.caps().catch(() => null),
      this.connection.getGenesisHash().catch(() => undefined),
    ]);
    if (!this.relayer) {
      relayerStatus =
        "no relayer configured (H081_RELAYER_URL is empty): withdrawals are sent by the agent key";
    } else {
      try {
        terms = await this.relayTerms();
        relayerStatus = "ok";
      } catch (e) {
        relayerStatus = `unavailable: ${(e as Error).message}; relayed withdrawals are refused until it is (direct: true still works)`;
      }
    }
    const host = rpcHost(this.config.rpcUrl);
    return {
      cluster: this.config.cluster,
      genesis,
      rpc: host,
      rpcIsPublic: PUBLIC_RPC_HOSTS.has(host),
      programs: {
        pool: this.config.poolProgramId.toBase58(),
        loan: this.config.loanProgramId.toBase58(),
        safety: this.config.safetyProgramId.toBase58(),
        capacity: this.config.capacityProgramId.toBase58(),
      },
      usdg: {
        mint: this.usdg.toBase58(),
        decimals: this.decimals,
        symbol: MAINNET.usdg.symbol,
      },
      h081: {
        mint: this.stakeMint.toBase58(),
        decimals: MAINNET.h081.decimals,
        symbol: MAINNET.h081.symbol,
      },
      loanTreasury: this.config.loanTreasury.toBase58(),
      caps: caps && {
        perDeposit: caps.perDeposit,
        perDepositUsdg: fromUnits(caps.perDeposit, this.decimals),
        total: caps.total,
        totalUsdg: fromUnits(caps.total, this.decimals),
        inVault: caps.inVault,
        inVaultUsdg: fromUnits(caps.inVault, this.decimals),
        paused: caps.paused,
      },
      stakeCaps: {
        perStake: MAINNET.stakeCaps.perStake,
        total: MAINNET.stakeCaps.total,
        cooldownDays: 30,
      },
      fees: {
        relayBps: terms?.feeBps ?? null,
        relayMin: terms?.minFee ?? null,
        loanOriginationBps: 25,
      },
      relayer: terms
        ? {
            url: terms.url,
            relayer: terms.relayer.toBase58(),
            minFee: terms.minFee,
            feeBps: terms.feeBps,
            feeAccount: terms.feeRecipient.toBase58(),
            treasury: terms.treasury,
            freeTier: terms.freeTier,
          }
        : null,
      relayerStatus,
      signer: this.signer.publicKey.toBase58(),
      shieldedAddress: this.shieldedAddress(),
      circuitsDir: this.config.circuitsDir,
      account: {
        source: this.accountSource,
        note: ACCOUNT_SOURCE_NOTES[this.accountSource],
      },
      notice: NOTICE,
    };
  }
}
