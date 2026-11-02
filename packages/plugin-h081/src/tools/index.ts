// The plugin's `methods`: plain async functions an agent program can call directly
// (`agent.methods.h081BankDeposit({ usdg: '25' })`). Each returns plain JSON (bigints as decimal strings).
import type { AgentLike } from "../bank.js";
import { bankFor } from "../bank.js";
import { plain, runOp } from "../core/operations.js";
import { type OpName, ZOD } from "../core/schemas.js";

async function run(
  agent: AgentLike,
  name: OpName,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const parsed = ZOD[name].safeParse(input ?? {});
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues
        .map((i) => `${i.path.join(".") || "input"}: ${i.message}`)
        .join("; "),
    );
  }
  return plain<Record<string, unknown>>(
    await runOp(
      await bankFor(agent),
      name,
      parsed.data as Record<string, unknown>,
    ),
  );
}

export const h081BankDeposit = (
  agent: AgentLike,
  input: { amount?: string; usdg?: string },
) => run(agent, "h081_bank_deposit", input);
export const h081BankWithdraw = (
  agent: AgentLike,
  input: { amount?: string; usdg?: string; to?: string; direct?: boolean },
) => run(agent, "h081_bank_withdraw", input);
export const h081BankBalance = (
  agent: AgentLike,
  input: Record<string, never> = {},
) => run(agent, "h081_bank_balance", input);
export const h081LoanQuote = (
  agent: AgentLike,
  input: {
    termsCode?: string;
    minRemaining?: string;
    minRemainingUsdg?: string;
    pledgeBps?: number;
    principal?: string;
    principalUsdg?: string;
    loanRef?: string;
  },
) => run(agent, "h081_loan_quote", input);
export const h081LoanBorrow = (
  agent: AgentLike,
  input: {
    termsCode: string;
    budget?: string;
    budgetUsdg?: string;
    dailyCap?: string;
    dailyCapUsdg?: string;
    maxPerTx?: string;
    maxPerTxUsdg?: string;
    days: number;
    unlockDays: number;
    agentIndex?: number;
  },
) => run(agent, "h081_loan_borrow", input);
export const h081Stake = (
  agent: AgentLike,
  input: {
    action: "view" | "stake" | "request_unstake" | "unstake";
    amount?: string;
    h081?: string;
  },
) => run(agent, "h081_stake", input);
export const h081ProtocolInfo = (
  agent: AgentLike,
  input: Record<string, never> = {},
) => run(agent, "h081_protocol_info", input);

export const METHODS = {
  h081BankDeposit,
  h081BankWithdraw,
  h081BankBalance,
  h081LoanQuote,
  h081LoanBorrow,
  h081Stake,
  h081ProtocolInfo,
};
export const METHOD_OF: Record<OpName, keyof typeof METHODS> = {
  h081_bank_deposit: "h081BankDeposit",
  h081_bank_withdraw: "h081BankWithdraw",
  h081_bank_balance: "h081BankBalance",
  h081_loan_quote: "h081LoanQuote",
  h081_loan_borrow: "h081LoanBorrow",
  h081_stake: "h081Stake",
  h081_protocol_info: "h081ProtocolInfo",
};
