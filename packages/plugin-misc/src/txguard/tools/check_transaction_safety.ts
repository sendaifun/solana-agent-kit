/**
 * txguard — deterministic Solana transaction safety pre-flight.
 *
 * Call BEFORE an agent signs: get a verdict + reasons. No model, no API key, no network — pure
 * structural analysis of a decoded transaction. An autonomous signer (or any Solana AI Kit agent)
 * can be drained by a crafted tx — a full-balance transfer to an unknown address, a
 * setAuthority/closeAccount seizure, an unlimited token delegate, or a call into an unknown program.
 * This catches the known drain patterns deterministically so a bad tx HALTs before signature.
 *
 * Fail-safe: anything unrecognised escalates toward `halt`, never a false `allow`.
 */

/** Known-good Solana programs (system, token, ATA, memo, compute budget, common DEX/stake). */
export const KNOWN_PROGRAMS: Record<string, string> = {
  "11111111111111111111111111111111": "system",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "spl-token",
  TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: "spl-token-2022",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: "associated-token",
  MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr: "memo",
  ComputeBudget111111111111111111111111111111: "compute-budget",
  JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: "jupiter-v6",
  Stake11111111111111111111111111111111111111: "stake",
};

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const UINT64_MAX = 18446744073709551615n; // 2**64 - 1, the canonical "unlimited" delegate amount

/** Instruction types that can drain or seize control, with their base severity. */
const DANGER_TYPES: Record<string, { severity: Severity; detail: string }> = {
  setAuthority: {
    severity: "halt",
    detail: "changes who controls an account/mint — classic seizure",
  },
  closeAccount: {
    severity: "warn",
    detail: "closes account & sends rent/balance to a destination — check dest",
  },
  approve: {
    severity: "warn",
    detail:
      "delegates token spend authority — check it is bounded & to a known spender",
  },
  approveChecked: {
    severity: "warn",
    detail: "delegates token spend authority — check amount & spender",
  },
};

export type Severity = "halt" | "warn";
export type Verdict = "allow" | "warn" | "halt";

/** A single decoded instruction. Unknown fields are tolerated; missing ones fail safe. */
export interface DecodedInstruction {
  program: string;
  type?: string;
  dest?: string;
  delegate?: string;
  /** New owner/authority for `assign` / `setAuthority`. */
  new_authority?: string;
  owner?: string;
  /** Lamports (System) or token base units. `"unlimited"` or 2^64-1 ⇒ unlimited delegate. */
  amount?: number | bigint | string | null;
  /** Per-instruction balance hint for full-drain detection. */
  balance?: number;
  /** Explicit hint that this transfer drains the whole balance. */
  drains_balance?: boolean;
}

export interface TxToCheck {
  fee_payer?: string;
  /** Accounts the agent controls. Anything paying out to a non-owned address is suspect. */
  owned_accounts?: string[];
  /** Current lamport balance of the fee payer, for split-drain detection. */
  balance?: number;
  instructions?: DecodedInstruction[];
}

export interface SafetyFlag {
  rule: string;
  severity: Severity;
  ix: number;
  detail: string;
}

export interface SafetyVerdict {
  verdict: Verdict;
  safe_to_sign: boolean;
  risk: number;
  n_instructions: number;
  flags: SafetyFlag[];
  summary: string;
}

function toBigInt(v: unknown): bigint | null {
  if (typeof v === "bigint") {
    return v;
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return BigInt(Math.trunc(v));
  }
  if (typeof v === "string" && /^\d+$/.test(v)) {
    return BigInt(v);
  }
  return null;
}

function isUnlimited(amount: DecodedInstruction["amount"]): boolean {
  if (amount === null || amount === undefined || amount === "unlimited") {
    return true;
  }
  return toBigInt(amount) === UINT64_MAX;
}

function isFullBalance(ix: DecodedInstruction, feePayer: string): boolean {
  if (ix.program !== SYSTEM_PROGRAM || ix.type !== "transfer") {
    return false;
  }
  const dest = ix.dest ?? "";
  if (dest && dest !== feePayer && ix.drains_balance) {
    return true;
  }
  const amt = toBigInt(ix.amount);
  const bal = toBigInt(ix.balance);
  return amt !== null && bal !== null && amt === bal;
}

/**
 * Deterministic pre-sign verdict. Never throws.
 * @param tx decoded transaction `{ fee_payer, owned_accounts?, balance?, instructions[] }`
 * @returns verdict (`allow | warn | halt`), per-rule flags, and a risk score in [0,1].
 */
export function checkTransactionSafety(tx: TxToCheck): SafetyVerdict {
  const flags: SafetyFlag[] = [];
  const feePayer = tx?.fee_payer ?? "";
  const owned = new Set(tx?.owned_accounts ?? (feePayer ? [feePayer] : []));
  const balance = toBigInt(tx?.balance);
  const instructions = tx?.instructions ?? [];
  let sysOut = 0n; // cumulative SOL leaving the fee payer (split-drain evasion)

  instructions.forEach((ix, i) => {
    // System `assign` hands an account to a new owner program → seizure
    if (ix.program === SYSTEM_PROGRAM && ix.type === "assign") {
      const newOwner = ix.owner || ix.new_authority || "";
      if (newOwner && !owned.has(newOwner) && !(newOwner in KNOWN_PROGRAMS)) {
        flags.push({
          rule: "assign_foreign_owner",
          severity: "halt",
          ix: i,
          detail: `reassigns account ownership to ${newOwner.slice(0, 12)}… — seizure`,
        });
      }
    }

    // cumulative drain: many small transfers that together empty the wallet
    if (
      ix.program === SYSTEM_PROGRAM &&
      ix.type === "transfer" &&
      ix.dest &&
      !owned.has(ix.dest)
    ) {
      const amt = toBigInt(ix.amount);
      if (amt !== null) {
        sysOut += amt;
      }
    }

    // unknown program → could do anything
    if (!(ix.program in KNOWN_PROGRAMS)) {
      flags.push({
        rule: "unknown_program",
        severity: "halt",
        ix: i,
        detail: `instruction calls unknown program ${(ix.program || "").slice(0, 12)}… — could do anything`,
      });
    }

    const t = ix.type ?? "";
    if (t in DANGER_TYPES) {
      let { severity, detail } = DANGER_TYPES[t];
      const target = ix.dest || ix.delegate || ix.new_authority || "";
      if (
        target &&
        !owned.has(target) &&
        (t === "setAuthority" || t === "closeAccount")
      ) {
        severity = "halt";
      }
      if (
        (t === "approve" || t === "approveChecked") &&
        isUnlimited(ix.amount)
      ) {
        severity = "halt";
        detail =
          "UNLIMITED token delegate — spender can drain the whole balance";
      }
      flags.push({ rule: t, severity, ix: i, detail });
    }

    if (isFullBalance(ix, feePayer)) {
      const dest = ix.dest ?? "";
      flags.push({
        rule: "full_balance_transfer",
        severity: owned.has(dest) ? "warn" : "halt",
        ix: i,
        detail: `moves (near) entire SOL balance to ${dest.slice(0, 8)}…`,
      });
    }
  });

  // cumulative split-drain: sum of foreign System transfers ≥ (near) whole balance
  if (balance !== null && balance > 0n && sysOut * 10n >= balance * 9n) {
    flags.push({
      rule: "cumulative_drain",
      severity: "halt",
      ix: -1,
      detail: `transfers total ${sysOut} ≥ 90% of balance ${balance} — split-drain`,
    });
  }

  const halts = flags.filter((f) => f.severity === "halt");
  const warns = flags.filter((f) => f.severity === "warn");
  const verdict: Verdict = halts.length
    ? "halt"
    : warns.length
      ? "warn"
      : "allow";
  const risk =
    Math.round(Math.min(1, 0.5 * halts.length + 0.2 * warns.length) * 100) /
    100;
  const summary = halts.length
    ? `⛔ ${halts.length} halt · ${warns.length} warn — DO NOT auto-sign`
    : warns.length
      ? `⚠ ${warns.length} warning(s) — review before signing`
      : "✅ no known drain patterns";

  return {
    verdict,
    safe_to_sign: verdict === "allow",
    risk,
    n_instructions: instructions.length,
    flags,
    summary,
  };
}

/**
 * Adapt a Solana RPC `getParsedTransaction` result → {@link checkTransactionSafety} input.
 * The RPC does the wire-decoding; we normalise program/type/dest/amount so the check runs on real
 * on-chain txs. Never throws — undecodable input degrades to an unknown program (→ halt).
 */
export function normalizeParsedTransaction(
  parsedTx: any,
  owner = "",
): TxToCheck {
  const tx: TxToCheck = {
    fee_payer: "",
    owned_accounts: owner ? [owner] : [],
    instructions: [],
  };
  try {
    const msg = parsedTx.transaction.message;
    const keys = msg.accountKeys ?? [];
    if (keys.length) {
      const k0 = keys[0];
      tx.fee_payer = typeof k0 === "object" && k0 !== null ? k0.pubkey : k0;
    }
    if (!owner && tx.fee_payer) {
      tx.owned_accounts = [tx.fee_payer];
    }
    for (const ix of msg.instructions ?? []) {
      const program =
        ix.programId?.toString?.() ?? ix.program ?? ix.programId ?? "";
      const parsed = ix.parsed;
      const row: DecodedInstruction = { program };
      if (parsed && typeof parsed === "object") {
        row.type = parsed.type;
        const info = parsed.info ?? {};
        row.dest = info.destination ?? info.newAuthority ?? info.delegate;
        row.delegate = info.delegate;
        row.new_authority = info.newAuthority;
        const rawAmt =
          info.lamports ??
          (typeof info.tokenAmount === "object" && info.tokenAmount !== null
            ? info.tokenAmount.amount
            : undefined) ??
          info.amount;
        row.amount = rawAmt ?? null;
      } else {
        row.type = "invoke"; // unparsed → flagged if program unknown
      }
      tx.instructions!.push(row);
    }
  } catch {
    tx.instructions!.push({ program: "UNDECODABLE", type: "invoke" }); // fail-safe → halt
  }
  return tx;
}

/** One call: adapt an RPC `getParsedTransaction` result and return the safety verdict. */
export function checkTransactionFromRpc(
  parsedTx: any,
  owner = "",
): SafetyVerdict {
  return checkTransactionSafety(normalizeParsedTransaction(parsedTx, owner));
}
