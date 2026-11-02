// Readable program errors. A failed Solana transaction surfaces as "custom program error: 0x1795" (in a
// simulation's logs, a SendTransactionError, or the "{"Custom":6037}" of a confirmed failure); this maps the
// code back to the Anchor variant name of the program that failed and a sentence an agent can act on.
import { SendTransactionError } from "@solana/web3.js";
import { RelayerError } from "../sdk/relayer-client.js";
import { LOAN_ERROR } from "../sdk/solana/lender.js";
import { POOL_ERROR } from "../sdk/solana/program.js";
import { SimulationError } from "../sdk/solana/send.js";
import { CAPACITY_ERROR, SAFETY_ERROR } from "../sdk/solana/token.js";

export type ProgramKind = "pool" | "loan" | "capacity" | "safety";

const invert = (t: Record<string, number>): Map<number, string> =>
  new Map(Object.entries(t).map(([k, v]) => [v, k]));
export const ERROR_NAMES: Record<ProgramKind, Map<number, string>> = {
  pool: invert(POOL_ERROR),
  loan: invert(LOAN_ERROR),
  capacity: invert(CAPACITY_ERROR),
  safety: invert(SAFETY_ERROR),
};

/** What to do about the errors an agent is likely to hit. */
export const ERROR_TEXT: Record<
  ProgramKind,
  Partial<Record<number, string>>
> = {
  pool: {
    [POOL_ERROR.DepositsPaused]:
      "new deposits are paused by the config authority; withdrawals still work",
    [POOL_ERROR.DepositTooLarge]:
      "the deposit is over the per-deposit cap (1,000 USDG on mainnet)",
    [POOL_ERROR.DepositCapExceeded]:
      "the bank holds at most 10,000 USDG in total on mainnet and this deposit would exceed it",
    [POOL_ERROR.DepositShortfall]:
      "the signer's USDG token account holds less than the deposit",
    [POOL_ERROR.UnknownRoot]:
      "the proof was made against a Merkle root the pool no longer remembers; sync and try again",
    [POOL_ERROR.AlreadySpent]:
      "a note in this operation was already spent (a concurrent operation from the same account?)",
    [POOL_ERROR.StaleTimestamp]: "the proof timestamp is stale; try again",
    [POOL_ERROR.Recipient]:
      "the recipient must be a wallet address (payouts go to its associated token account)",
    [POOL_ERROR.InvalidProof]:
      "the program rejected the proof (wrong proving key? run fetch-circuits to refresh the artifacts)",
    [POOL_ERROR.FeeExceedsAmount]: "the relay fee is larger than the amount",
    [POOL_ERROR.WrongMint]: "the token account is for another mint",
    [POOL_ERROR.Lender]: "the lender account does not match the pledge",
  },
  loan: {
    [LOAN_ERROR.AlreadyFunded]: "this loan slot is already funded",
    [LOAN_ERROR.NotTheLender]: "only the slot owner (the lender) may do this",
    [LOAN_ERROR.NoLoan]: "this slot has no funded loan",
    [LOAN_ERROR.PayoutNotProven]:
      "the stream proof audience is not the payout account",
    [LOAN_ERROR.PrincipalTooLarge]:
      "the principal is more than the pledged share of the proven stream can repay",
    [LOAN_ERROR.BadTreasury]:
      "the fee treasury account is wrong (it must be the treasury owner's token account)",
    [LOAN_ERROR.StreamNotStarted]: "the pledged stream has not started yet",
  },
  capacity: {
    [CAPACITY_ERROR.StakingPaused]:
      "staking is paused by the config authority; unstaking still works",
    [CAPACITY_ERROR.StakeCap]:
      "over a staking cap (100,000 H081 per stake, 1,000,000 H081 total on mainnet)",
    [CAPACITY_ERROR.MoreThanStaked]: "you asked to unstake more than is staked",
    [CAPACITY_ERROR.NothingPending]:
      "nothing is waiting to unstake; call request_unstake first",
    [CAPACITY_ERROR.Cooldown]: "the 30-day cooldown has not passed yet",
    [CAPACITY_ERROR.Amount]: "the amount must be positive",
  },
  safety: {
    [SAFETY_ERROR.DepositsPaused]: "safety pool deposits are paused",
    [SAFETY_ERROR.DepositCap]: "over a safety pool deposit cap",
    [SAFETY_ERROR.Cooldown]: "the 14-day cooldown has not passed yet",
  },
};

/** The Anchor custom error code in an error's message or logs, if any. */
export function programErrorCode(e: unknown): number | undefined {
  const text = errorText(e);
  const m = /custom program error: 0x([0-9a-fA-F]+)/.exec(text);
  if (m) {
    return parseInt(m[1], 16);
  }
  const n = /Error Number: (\d+)/.exec(text) ?? /"Custom":\s*(\d+)/.exec(text);
  return n ? parseInt(n[1], 10) : undefined;
}

/** Message plus logs of a failed transaction (SimulationError, SendTransactionError, or anything with `.logs`). */
export function errorText(e: unknown): string {
  if (e instanceof SimulationError) {
    return `${e.message}\n${e.logs.join("\n")}`;
  }
  if (e instanceof SendTransactionError) {
    return `${e.message}\n${(e.logs ?? []).join("\n")}`;
  }
  const o = e as { message?: unknown; logs?: unknown };
  if (o && typeof o === "object") {
    const logs = Array.isArray(o.logs)
      ? (o.logs as unknown[]).map(String).join("\n")
      : "";
    return `${o.message !== undefined ? String(o.message) : String(e)}\n${logs}`;
  }
  return String(e);
}

/** Which known program failed, from the "Program <id> failed" log line, when `ids` is given. */
export function programOf(
  e: unknown,
  ids: Partial<Record<ProgramKind, string>>,
): ProgramKind | undefined {
  const text = errorText(e);
  const failed = [
    ...text.matchAll(/Program ([1-9A-HJ-NP-Za-km-z]{32,44}) failed/g),
  ].map((m) => m[1]);
  for (const id of failed.reverse()) {
    for (const [kind, known] of Object.entries(ids) as Array<
      [ProgramKind, string | undefined]
    >) {
      if (known && known === id) {
        return kind;
      }
    }
  }
  return undefined;
}

export interface ExplainOptions {
  /** the program the caller was talking to (used when the logs do not name one) */
  program?: ProgramKind;
  /** program ids, to recognize which one failed from the logs */
  ids?: Partial<Record<ProgramKind, string>>;
}

/**
 * A one-line explanation: "DepositCapExceeded (6037, stipend_pool): the bank holds at most 10,000 USDG…".
 * Relayer refusals pass through with their stable code; anything else is the original message.
 */
export function explainProgramError(
  e: unknown,
  opts: ExplainOptions = {},
): string {
  if (e instanceof RelayerError) {
    return `the relayer refused it (${e.status} ${e.code}): ${e.message.replace(/^relayer \d+ \S+: /, "")}`;
  }
  const code = programErrorCode(e);
  if (code === undefined) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/expired before it was confirmed/.test(msg)) {
      return `${msg} (the network dropped the transaction; nothing was spent)`;
    }
    return msg;
  }
  const kind = (opts.ids && programOf(e, opts.ids)) ?? opts.program;
  const label = {
    pool: "stipend_pool",
    loan: "stream_loan",
    capacity: "capacity_stake",
    safety: "safety_pool",
  };
  if (kind) {
    const name = ERROR_NAMES[kind].get(code);
    if (name) {
      const text = ERROR_TEXT[kind][code];
      return `${name} (${code}, ${label[kind]})${text ? `: ${text}` : ""}`;
    }
  }
  // not an Anchor error of a known program (a token program error, or a code outside the tables)
  const guesses = (["pool", "loan", "capacity"] as ProgramKind[])
    .filter((k) => ERROR_NAMES[k].has(code) && (!kind || k === kind))
    .map((k) => `${ERROR_NAMES[k].get(code)} (${label[k]})`);
  return `program error ${code}${guesses.length ? `: ${guesses.join(" or ")}` : ""}`;
}

/** An error whose message is the explanation; `cause` keeps the original. */
export class H081Error extends Error {
  readonly code?: number;
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "H081Error";
    this.code = programErrorCode(cause);
  }
}

/** Rethrows `e` explained. */
export function explained(e: unknown, opts: ExplainOptions = {}): H081Error {
  if (e instanceof H081Error) {
    return e;
  }
  return new H081Error(explainProgramError(e, opts), e);
}
