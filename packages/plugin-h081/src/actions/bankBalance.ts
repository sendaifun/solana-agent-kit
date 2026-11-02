import { makeAction } from "./factory.js";

export const bankBalanceAction = makeAction({
  op: "h081_bank_balance",
  name: "H081_BANK_BALANCE",
  similes: [
    "h081 balance",
    "my shielded usdg balance",
    "how much is in my private bank account",
    "check h081 account",
  ],
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          shielded: "25000000",
          shieldedUsdg: "25",
          walletUsdg: "100000000",
          walletUsdgHuman: "100",
          walletSol: 0.21,
          signer: "AgentWallet…",
          shieldedAddress: { pk: "1234…", viewPub: "0xab…" },
          subAccounts: [],
          agentAllowances: [],
          caps: {
            perDeposit: "1000000000",
            total: "10000000000",
            inVault: "2500000000",
            paused: false,
          },
        },
        explanation:
          "The shielded balance (visible only to this key), the wallet's public balances and the live deposit caps.",
      },
    ],
  ],
});
