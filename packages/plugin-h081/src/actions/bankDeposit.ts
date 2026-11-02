import { makeAction } from "./factory.js";

export const bankDepositAction = makeAction({
  op: "h081_bank_deposit",
  name: "H081_BANK_DEPOSIT",
  similes: [
    "deposit usdg into h081",
    "shield usdg",
    "put usdg in the private bank",
    "fund my h081 account",
    "deposit to h081 capital",
  ],
  examples: [
    [
      {
        input: { usdg: "25" },
        output: {
          status: "success",
          signature: "5uGn…",
          amount: "25000000",
          amountUsdg: "25",
          shielded: "25000000",
          shieldedUsdg: "25",
        },
        explanation:
          "Deposit 25 USDG from the agent wallet into its shielded H081 account.",
      },
      {
        input: { amount: "1000000" },
        output: {
          status: "success",
          signature: "3Xy…",
          amount: "1000000",
          amountUsdg: "1",
          shielded: "26000000",
          shieldedUsdg: "26",
        },
        explanation: "The same in base units (6 decimals): 1,000,000 = 1 USDG.",
      },
      {
        input: { usdg: "5000" },
        output: {
          status: "error",
          message:
            "DepositTooLarge: at most 1000 USDG per deposit (asked 5000).",
        },
        explanation:
          "Over the per-deposit cap: refused before any proof is made.",
      },
    ],
  ],
});
