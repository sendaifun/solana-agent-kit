import { runEvals } from "../utils/runEvals";

const CREATE_DRIFT_VAULT_DATASET = [
  {
    inputs: {
      query: "Create a drift vault named 'MyVault', market is SOL-USDC, redeemPeriod=3 days, maxTokens=1000, minDepositAmount=10, managementFee=5, profitShare=10, permissioned=true"
    },
    referenceOutputs: {
      tool: "create_drift_vault",
      response: JSON.stringify({
        name: "MyVault",
        marketName: "SOL-USDC",
        redeemPeriod: 3,
        maxTokens: 1000,
        minDepositAmount: 10,
        managementFee: 5,
        profitShare: 10,
        permissioned: true
      }),
    },
  },
  {
    inputs: {
      query: "Create a drift vault named 'TestVault' with redeemPeriod=1 day, maxTokens=2000, profitShare=7"
    },
    referenceOutputs: {
      tool: "create_drift_vault",
      response: JSON.stringify({
        name: "TestVault",
        redeemPeriod: 1,
        maxTokens: 2000,
        profitShare: 7
      }),
    },
  },
];

runEvals(CREATE_DRIFT_VAULT_DATASET, "solana_create_drift_vault eval");