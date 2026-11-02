import { makeAction } from "./factory.js";

export const loanQuoteAction = makeAction({
  op: "h081_loan_quote",
  name: "H081_LOAN_QUOTE",
  similes: [
    "quote an h081 loan",
    "how much can i borrow against my stream",
    "price a stream-backed loan",
    "h081 loan terms",
    "check a loan slot",
  ],
  examples: [
    [
      {
        input: { pledgeBps: 4000, minRemainingUsdg: "100" },
        output: {
          status: "success",
          pledgeBps: 4000,
          minRemaining: "100000000",
          maxPrincipal: "40000000",
          principal: "40000000",
          originationFee: "100000",
          originationFeeBps: 25,
          payout: "39900000",
        },
        explanation:
          "A 100 USDG allowance pledged at 40% backs at most 40 USDG of principal; the protocol takes 0.25% (0.1 USDG) out of the payout.",
      },
      {
        input: { loanRef: "3" },
        output: {
          status: "success",
          pledgeBps: 0,
          minRemaining: "0",
          maxPrincipal: "0",
          principal: "0",
          originationFee: "0",
          originationFeeBps: 25,
          payout: "0",
          loanRef: "3",
          slot: {
            loanRef: "3",
            funded: false,
            settled: false,
            principal: "0",
            repaid: "0",
            lender: "Slot…",
          },
        },
        explanation: "Read loan slot #3 on chain: open and unfunded.",
      },
    ],
  ],
});
