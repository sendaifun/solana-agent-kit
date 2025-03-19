import { runEvals } from "../utils/runEvals";

const DEPOSIT_INTO_DRIFT_VAULT_DATASET = [
  {
    inputs: {
      query: "Deposit 50 USDC into vault GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB"
    },
    referenceOutputs: {
      tool: "deposit_into_drift_vault",
      response: JSON.stringify({
        vaultAddress: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        amount: 50
      }),
    },
  },
  {
    inputs: {
      query: "Deposit 2.5 USDC into drift vault at MqL7H1eBsNh9Zs1yjE3N1p7u4n6fne9p5zxyGFWi8uC"
    },
    referenceOutputs: {
      tool: "deposit_into_drift_vault",
      response: JSON.stringify({
        vaultAddress: "MqL7H1eBsNh9Zs1yjE3N1p7u4n6fne9p5zxyGFWi8uC",
        amount: 2.5
      }),
    },
  },
];

runEvals(DEPOSIT_INTO_DRIFT_VAULT_DATASET, "solana_deposit_into_drift_vault eval");