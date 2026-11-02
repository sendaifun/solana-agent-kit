// Input schemas of the seven operations, once as zod (the Agent Kit actions validate with it) and once as
// JSON Schema (what an MCP client shows its model), kept side by side so they say the same thing.
// Amounts are strings: `amount` in base units (integer) or `usdg` / `h081` as a decimal token amount.
import { z } from "zod";

const BASE = /^\d+$/;
const DECIMAL = /^\d+(\.\d+)?$/;
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const OPS = [
  "h081_bank_deposit",
  "h081_bank_withdraw",
  "h081_bank_balance",
  "h081_loan_quote",
  "h081_loan_borrow",
  "h081_stake",
  "h081_protocol_info",
] as const;
export type OpName = (typeof OPS)[number];

const NOTICE_SHORT =
  "H081 Capital is live on Solana mainnet, not audited yet; use at your own risk.";

export const DESCRIPTIONS: Record<OpName, string> = {
  h081_bank_deposit:
    "Deposit USDG from the agent wallet into its private (shielded) H081 bank account on Solana. The chain sees the " +
    "depositor and the amount; the shielded balance and every later move inside the bank are private. Caps (read from " +
    "chain before any proof is made): at most 1,000 USDG per deposit and 10,000 USDG in the bank in total; deposits can be " +
    "paused by the config authority, withdrawals never. Needs ~0.02 SOL in the agent wallet for buffer rent (refunded) and fees. " +
    "Give `amount` (base units, 6 decimals) or `usdg` (decimal). " +
    NOTICE_SHORT,
  h081_bank_withdraw:
    "Withdraw USDG from the shielded account to a Solana wallet (default: the agent wallet). By default the relayer sends " +
    "the transaction and takes its fee out of the amount: max(0.05 USDG, 0.20%) of the public amount, paid to the protocol " +
    "treasury (checked before anything is proven); the chain then does not link the agent wallet to the withdrawal. If the " +
    "relayer is unreachable or refuses, the withdrawal is NOT sent and the error says why; it is never silently sent by the " +
    "agent key. Above the relayer's anonymous free tier (100 USDG per 30 days today) the agent wallet is named to the relayer " +
    "as capacity operator, which needs H081 staked in capacity_stake (`h081_stake`); otherwise split the withdrawal or go direct. " +
    "`direct: true` has the agent key send it instead (no relay fee, no limit, but the agent wallet is visible on chain as the " +
    "sender). Give `amount` or `usdg`. " +
    NOTICE_SHORT,
  h081_bank_balance:
    "The shielded USDG balance of the agent's H081 bank account (visible only to this key), its agent allowances, the " +
    "wallet's public USDG and SOL balances, and the current deposit caps. Read-only.",
  h081_loan_quote:
    "Price a stream-backed loan without sending anything. From a lender's `h081-loan-terms:` code (or `pledgeBps` and " +
    "`minRemaining` directly) it returns the largest principal that pledge can back (minRemaining * pledgeBps / 10000), " +
    "the 0.25% origination fee the protocol takes out of the payout, and the payout. With `loanRef` it also reads the " +
    "slot's on-chain status (funded, principal, repaid, expiry). There is no on-chain offer book: terms come from a " +
    "lender off-chain. Read-only.",
  h081_loan_borrow:
    "Pledge an agent allowance to a lender's loan slot and produce the proof the lender funds against. The agent's " +
    "shielded balance funds an allowance of `budget` USDG to a sub-account that unlocks as a stream over `unlockDays`, " +
    "with `pledgeBps` of every payment from it routed to the lender (from the terms code), then makes the stream proof " +
    "and returns it as an `h081-loan-proof:` code. Hand that code to the lender: when they fund the slot, the principal " +
    "minus the 0.25% origination fee lands in the agent wallet's USDG account. This is a two-party flow with no " +
    "automatic matching: without a lender who funds, nothing is borrowed. Needs the grant (44 MB) and stream circuits. " +
    NOTICE_SHORT,
  h081_stake:
    "capacity_stake: stake H081 from the agent wallet to earn relayer capacity (desks and shield capacity: how much " +
    "the relayer relays for this wallet per 30 days above the anonymous free tier, used by h081_bank_withdraw), request " +
    "unstake (30-day cooldown), unstake after the cooldown, or `view` the position. Caps: 100,000 H081 per stake, " +
    "1,000,000 H081 total. Give `amount` (base units, 6 decimals) or `h081` (decimal) for stake / request_unstake. " +
    NOTICE_SHORT,
  h081_protocol_info:
    "Static and live facts about the H081 Capital bank: cluster, program ids, USDG and H081 mints, deposit caps and " +
    "pause flag read from chain, relayer terms and status, the agent wallet and shielded address, how the shielded " +
    "account secret is derived, where the proving artifacts live, and the risk notice. Reports only the RPC host, never " +
    "the full RPC URL. Read-only.",
};

// ------------------------------------------------------------------ zod

const amountZ = z.string().regex(BASE, "base units: an integer string");
const decimalZ = z.string().regex(DECIMAL, 'a decimal amount like "12.5"');
const b58Z = z.string().regex(BASE58, "a base58 Solana address");

const exactlyOne = (a: string, b: string) => (o: Record<string, unknown>) =>
  (o[a] !== undefined) !== (o[b] !== undefined);
const oneOfMsg = (a: string, b: string) => ({
  message: `give exactly one of "${a}" (base units) or "${b}" (decimal)`,
});

export const DepositZ = z
  .object({ amount: amountZ.optional(), usdg: decimalZ.optional() })
  .strict()
  .refine(exactlyOne("amount", "usdg"), oneOfMsg("amount", "usdg"));

export const WithdrawZ = z
  .object({
    amount: amountZ.optional(),
    usdg: decimalZ.optional(),
    to: b58Z.optional(),
    direct: z.boolean().optional(),
  })
  .strict()
  .refine(exactlyOne("amount", "usdg"), oneOfMsg("amount", "usdg"));

export const BalanceZ = z.object({}).strict();

export const LoanQuoteZ = z
  .object({
    termsCode: z.string().optional(),
    minRemaining: amountZ.optional(),
    minRemainingUsdg: decimalZ.optional(),
    pledgeBps: z.number().int().min(1).max(10000).optional(),
    principal: amountZ.optional(),
    principalUsdg: decimalZ.optional(),
    loanRef: z.string().regex(BASE).optional(),
  })
  .strict();

export const LoanBorrowZ = z
  .object({
    termsCode: z.string().min(1),
    budget: amountZ.optional(),
    budgetUsdg: decimalZ.optional(),
    dailyCap: amountZ.optional(),
    dailyCapUsdg: decimalZ.optional(),
    maxPerTx: amountZ.optional(),
    maxPerTxUsdg: decimalZ.optional(),
    days: z.number().positive().max(3650),
    unlockDays: z.number().positive().max(3650),
    agentIndex: z.number().int().min(0).max(15).optional(),
  })
  .strict()
  .refine(exactlyOne("budget", "budgetUsdg"), oneOfMsg("budget", "budgetUsdg"))
  .refine((o) => o.unlockDays <= o.days, {
    message: "unlockDays must not exceed days",
  });

export const STAKE_ACTIONS = [
  "view",
  "stake",
  "request_unstake",
  "unstake",
] as const;
export const StakeZ = z
  .object({
    action: z.enum(STAKE_ACTIONS),
    amount: amountZ.optional(),
    h081: decimalZ.optional(),
  })
  .strict()
  .refine(
    (o) =>
      o.action === "stake" || o.action === "request_unstake"
        ? exactlyOne("amount", "h081")(o)
        : o.amount === undefined && o.h081 === undefined,
    {
      message:
        'stake and request_unstake take exactly one of "amount" (base units) or "h081" (decimal); view and unstake take no amount',
    },
  );

export const ProtocolInfoZ = z.object({}).strict();

export const ZOD: Record<OpName, z.ZodType<any>> = {
  h081_bank_deposit: DepositZ,
  h081_bank_withdraw: WithdrawZ,
  h081_bank_balance: BalanceZ,
  h081_loan_quote: LoanQuoteZ,
  h081_loan_borrow: LoanBorrowZ,
  h081_stake: StakeZ,
  h081_protocol_info: ProtocolInfoZ,
};

// ------------------------------------------------------------------ JSON Schema (MCP inputSchema)

const amountJ = {
  type: "string",
  pattern: BASE.source,
  description: 'base units (USDG has 6 decimals): "1000000" = 1 USDG',
};
const decimalJ = (unit: string) => ({
  type: "string",
  pattern: DECIMAL.source,
  description: `decimal ${unit} amount, e.g. "12.5"`,
});
const b58J = {
  type: "string",
  pattern: BASE58.source,
  description: "base58 Solana wallet address",
};

export const JSON_SCHEMA: Record<OpName, Record<string, unknown>> = {
  h081_bank_deposit: {
    type: "object",
    properties: { amount: amountJ, usdg: decimalJ("USDG") },
    additionalProperties: false,
    description: "exactly one of amount (base units) or usdg (decimal)",
  },
  h081_bank_withdraw: {
    type: "object",
    properties: {
      amount: amountJ,
      usdg: decimalJ("USDG"),
      to: {
        ...b58J,
        description:
          "recipient wallet (default: the agent wallet); must be a wallet, not a token account or program",
      },
      direct: {
        type: "boolean",
        description:
          "true: the agent key sends the withdrawal itself (no relay fee, no free-tier limit, sender visible on chain); default false: through the relayer, refused (not sent) when the relayer is unavailable",
      },
    },
    additionalProperties: false,
    description: "exactly one of amount (base units) or usdg (decimal)",
  },
  h081_bank_balance: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  h081_loan_quote: {
    type: "object",
    properties: {
      termsCode: {
        type: "string",
        description:
          'a lender\'s "h081-loan-terms:" code (gives pledgeBps and the slot)',
      },
      minRemaining: {
        ...amountJ,
        description: "the allowance budget the proof will state (base units)",
      },
      minRemainingUsdg: decimalJ("USDG"),
      pledgeBps: {
        type: "integer",
        minimum: 1,
        maximum: 10000,
        description:
          "share of every payment routed to the lender, basis points",
      },
      principal: {
        ...amountJ,
        description: "a principal to price (base units); default: the maximum",
      },
      principalUsdg: decimalJ("USDG"),
      loanRef: {
        type: "string",
        pattern: BASE.source,
        description: "loan slot number to read on chain",
      },
    },
    additionalProperties: false,
  },
  h081_loan_borrow: {
    type: "object",
    properties: {
      termsCode: {
        type: "string",
        description: 'the lender\'s "h081-loan-terms:" code',
      },
      budget: {
        ...amountJ,
        description:
          "allowance budget taken from the shielded balance (base units)",
      },
      budgetUsdg: decimalJ("USDG"),
      dailyCap: {
        ...amountJ,
        description:
          "most the sub-account may pay per day (base units); default: no daily cap",
      },
      dailyCapUsdg: decimalJ("USDG"),
      maxPerTx: {
        ...amountJ,
        description:
          "most per payment (base units); default: no per-payment cap",
      },
      maxPerTxUsdg: decimalJ("USDG"),
      days: {
        type: "number",
        exclusiveMinimum: 0,
        maximum: 3650,
        description: "lifetime of the allowance in days",
      },
      unlockDays: {
        type: "number",
        exclusiveMinimum: 0,
        maximum: 3650,
        description:
          "the budget unlocks linearly over this many days (<= days)",
      },
      agentIndex: {
        type: "integer",
        minimum: 0,
        maximum: 15,
        description: "which sub-account to use (default: the first free one)",
      },
    },
    required: ["termsCode", "days", "unlockDays"],
    additionalProperties: false,
    description: "exactly one of budget (base units) or budgetUsdg (decimal)",
  },
  h081_stake: {
    type: "object",
    properties: {
      action: { type: "string", enum: [...STAKE_ACTIONS] },
      amount: {
        ...amountJ,
        description:
          "base units (H081 has 6 decimals), for stake / request_unstake",
      },
      h081: decimalJ("H081"),
    },
    required: ["action"],
    additionalProperties: false,
  },
  h081_protocol_info: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
};

/** Example inputs (one per operation) that the schemas accept; the plugin's action examples and tests use them. */
export const EXAMPLE_INPUTS: Record<OpName, Record<string, unknown>[]> = {
  h081_bank_deposit: [{ usdg: "25" }, { amount: "1000000" }],
  h081_bank_withdraw: [
    { usdg: "10" },
    {
      amount: "5000000",
      to: "E1ZAVTjMEAtPoUPAfsLrfJHpTXNtdmzgBWuZtUM1uKKv",
      direct: true,
    },
  ],
  h081_bank_balance: [{}],
  h081_loan_quote: [
    { pledgeBps: 4000, minRemainingUsdg: "100" },
    { loanRef: "3" },
  ],
  h081_loan_borrow: [
    {
      termsCode: "h081-loan-terms:eyJ2IjoxfQ",
      budgetUsdg: "100",
      dailyCapUsdg: "20",
      maxPerTxUsdg: "10",
      days: 30,
      unlockDays: 30,
    },
  ],
  h081_stake: [
    { action: "view" },
    { action: "stake", h081: "100" },
    { action: "request_unstake", amount: "100000000" },
    { action: "unstake" },
  ],
  h081_protocol_info: [{}],
};
