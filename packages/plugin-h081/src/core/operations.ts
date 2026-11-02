// The seven operations as plain functions over a bank: argument parsing here, chain work in H081Bank. The MCP
// tools and the Agent Kit actions are thin wrappers around `runOp`, so both expose exactly the same behavior
// and the tests can drive them against a mocked bank.
import { PublicKey } from "@solana/web3.js";
import type { H081Bank } from "./bank.js";
import { MAINNET } from "./constants.js";
import { type OpName, STAKE_ACTIONS } from "./schemas.js";
import { parseAmount } from "./units.js";

/** What an operation needs from the bank (H081Bank satisfies it; tests pass a mock). */
export type BankLike = Pick<
  H081Bank,
  | "deposit"
  | "withdraw"
  | "balance"
  | "loanQuote"
  | "borrow"
  | "stakeView"
  | "stake"
  | "requestUnstake"
  | "unstake"
  | "protocolInfo"
> & { decimals: number };

export type Args = Record<string, unknown>;

const USDG_DECIMALS = MAINNET.usdg.decimals;
const H081_DECIMALS = MAINNET.h081.decimals;

export async function opDeposit(bank: BankLike, args: Args) {
  return bank.deposit(parseAmount(args, "usdg", bank.decimals));
}

export async function opWithdraw(bank: BankLike, args: Args) {
  const amount = parseAmount(args, "usdg", bank.decimals);
  let to: PublicKey | undefined;
  if (
    args.to !== undefined &&
    args.to !== null &&
    String(args.to).trim() !== ""
  ) {
    try {
      to = new PublicKey(String(args.to).trim());
    } catch {
      throw new Error("`to` must be a base58 Solana wallet address");
    }
  }
  const direct = args.direct === true || args.direct === "true";
  return bank.withdraw(amount, to, direct);
}

export async function opBalance(bank: BankLike, _args: Args) {
  return bank.balance();
}

export async function opLoanQuote(bank: BankLike, args: Args) {
  const has = (k: string) =>
    args[k] !== undefined && args[k] !== null && String(args[k]).trim() !== "";
  const minRemaining =
    has("minRemaining") || has("minRemainingUsdg")
      ? parseAmount(args, "minRemainingUsdg", USDG_DECIMALS, {
          baseKey: "minRemaining",
          positive: false,
        })
      : undefined;
  const principal =
    has("principal") || has("principalUsdg")
      ? parseAmount(args, "principalUsdg", USDG_DECIMALS, {
          baseKey: "principal",
          positive: false,
        })
      : undefined;
  let pledgeBps: number | undefined;
  if (has("pledgeBps")) {
    pledgeBps = Number(args.pledgeBps);
    if (!Number.isInteger(pledgeBps) || pledgeBps < 1 || pledgeBps > 10000) {
      throw new Error("pledgeBps must be an integer 1..10000");
    }
  }
  let loanRef: bigint | undefined;
  if (has("loanRef")) {
    if (!/^\d+$/.test(String(args.loanRef).trim())) {
      throw new Error("loanRef must be a non-negative integer");
    }
    loanRef = BigInt(String(args.loanRef).trim());
  }
  return bank.loanQuote({
    termsCode: has("termsCode") ? String(args.termsCode) : undefined,
    minRemaining,
    pledgeBps,
    principal,
    loanRef,
  });
}

export async function opLoanBorrow(bank: BankLike, args: Args) {
  const termsCode = String(args.termsCode ?? "").trim();
  if (!termsCode) {
    throw new Error(
      'termsCode (the lender\'s "h081-loan-terms:" code) is required',
    );
  }
  const has = (k: string) =>
    args[k] !== undefined && args[k] !== null && String(args[k]).trim() !== "";
  const budget = parseAmount(args, "budgetUsdg", USDG_DECIMALS, {
    baseKey: "budget",
  });
  const dailyCap =
    has("dailyCap") || has("dailyCapUsdg")
      ? parseAmount(args, "dailyCapUsdg", USDG_DECIMALS, {
          baseKey: "dailyCap",
        })
      : undefined;
  const maxPerTx =
    has("maxPerTx") || has("maxPerTxUsdg")
      ? parseAmount(args, "maxPerTxUsdg", USDG_DECIMALS, {
          baseKey: "maxPerTx",
        })
      : undefined;
  const days = Number(args.days),
    unlockDays = Number(args.unlockDays);
  if (!(days > 0) || !(unlockDays > 0)) {
    throw new Error("days and unlockDays must be positive numbers");
  }
  if (unlockDays > days) {
    throw new Error("unlockDays must not exceed days");
  }
  let agentIndex: number | undefined;
  if (has("agentIndex")) {
    agentIndex = Number(args.agentIndex);
    if (!Number.isInteger(agentIndex) || agentIndex < 0 || agentIndex > 15) {
      throw new Error("agentIndex must be 0..15");
    }
  }
  return bank.borrow(termsCode, {
    budget,
    dailyCap,
    maxPerTx,
    days,
    unlockDays,
    agentIndex,
  });
}

export async function opStake(bank: BankLike, args: Args) {
  const action = String(args.action ?? "view");
  if (!(STAKE_ACTIONS as readonly string[]).includes(action)) {
    throw new Error(`action must be one of ${STAKE_ACTIONS.join(", ")}`);
  }
  switch (action) {
    case "view":
      return bank.stakeView();
    case "stake":
      return bank.stake(parseAmount(args, "h081", H081_DECIMALS));
    case "request_unstake":
      return bank.requestUnstake(parseAmount(args, "h081", H081_DECIMALS));
    default:
      return bank.unstake();
  }
}

export async function opProtocolInfo(bank: BankLike, _args: Args) {
  return bank.protocolInfo();
}

export const OPERATIONS: Record<
  OpName,
  (bank: BankLike, args: Args) => Promise<unknown>
> = {
  h081_bank_deposit: opDeposit,
  h081_bank_withdraw: opWithdraw,
  h081_bank_balance: opBalance,
  h081_loan_quote: opLoanQuote,
  h081_loan_borrow: opLoanBorrow,
  h081_stake: opStake,
  h081_protocol_info: opProtocolInfo,
};

export function runOp(
  bank: BankLike,
  name: OpName,
  args: Args = {},
): Promise<unknown> {
  const op = OPERATIONS[name];
  if (!op) {
    throw new Error(`unknown operation ${name}`);
  }
  return op(bank, args);
}

/** Converts an operation result to plain JSON (bigints as decimal strings, bytes as 0x hex). */
export function plain<T = unknown>(value: unknown): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) =>
      typeof v === "bigint"
        ? v.toString()
        : v instanceof Uint8Array
          ? "0x" + Buffer.from(v).toString("hex")
          : v,
    ),
  );
}
