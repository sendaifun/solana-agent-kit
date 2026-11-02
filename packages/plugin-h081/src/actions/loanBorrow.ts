import { makeAction } from "./factory.js";

export const loanBorrowAction = makeAction({
  op: "h081_loan_borrow",
  name: "H081_LOAN_BORROW",
  similes: [
    "pledge to an h081 loan",
    "borrow against my stream",
    "make the lender proof",
    "accept loan terms",
    "open a pledged sub-account",
  ],
  examples: [
    [
      {
        input: {
          termsCode: "h081-loan-terms:eyJ2IjoxLCJjbHVzdGVy…",
          budgetUsdg: "100",
          dailyCapUsdg: "20",
          maxPerTxUsdg: "10",
          days: 30,
          unlockDays: 30,
        },
        output: {
          status: "success",
          agentIndex: 0,
          allowanceId: "8713…",
          loanRef: "3",
          pledgeBps: "4000",
          grantSignature: "5Qr…",
          proofCode: "h081-loan-proof:eyJ2IjoxLC…",
          maxPrincipal: "40000000",
          originationFeeAtMax: "100000",
          payoutAccount: "AgentUsdgAta…",
          next: "hand proofCode to the lender; they can fund up to 40 USDG against it, and the principal minus the 0.25% origination fee arrives in AgentUsdgAta… when they do",
        },
        explanation:
          "Pledge a 100 USDG streaming allowance (unlocking over 30 days, 40% of each payment to the lender) to the lender's slot and return the proof code the lender funds against. Nothing is borrowed until the lender funds.",
      },
    ],
  ],
});
